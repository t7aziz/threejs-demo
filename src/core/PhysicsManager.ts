import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

class PhysicsManager {
    private world: RAPIER.World | null = null;
    private initialized = false;
    private rigidBodies = new Map<THREE.Mesh, RAPIER.RigidBody>();
    private colliders = new Map<THREE.Mesh, RAPIER.Collider>();

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            await RAPIER.init();

            // Create physics world with gravity
            const gravity = { x: 0.0, y: -9.81, z: 0.0 };
            this.world = new RAPIER.World(gravity);

            this.initialized = true;
            console.log('Physics engine initialized');
        } catch (error) {
            console.error('Failed to initialize physics:', error);
            throw error;
        }
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    getWorld(): RAPIER.World {
        if (!this.world) throw new Error('Physics not initialized');
        return this.world;
    }

    // Create a dynamic rigid body (affected by physics)
    createDynamicBody(
        mesh: THREE.Mesh,
        shape: 'box' | 'sphere',
        mass: number = 1.0
    ): void {
        if (!this.world) throw new Error('Physics not initialized');

        // Create rigid body descriptor
        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(mesh.position.x, mesh.position.y, mesh.position.z);

        const rigidBody = this.world.createRigidBody(rigidBodyDesc);

        // Create collider based on shape
        let colliderDesc: RAPIER.ColliderDesc;

        if (shape === 'box') {
            // Get box dimensions from mesh geometry
            const geometry = mesh.geometry as THREE.BoxGeometry;
            const params = geometry.parameters;
            colliderDesc = RAPIER.ColliderDesc.cuboid(
                params.width / 2,
                params.height / 2,
                params.depth / 2
            );
        } else {
            // Get sphere radius from mesh geometry
            const geometry = mesh.geometry as THREE.SphereGeometry;
            const params = geometry.parameters;
            colliderDesc = RAPIER.ColliderDesc.ball(params.radius);
        }

        colliderDesc.setMass(mass);
        colliderDesc.setRestitution(0.3); // Bounciness
        colliderDesc.setFriction(0.5);

        const collider = this.world.createCollider(colliderDesc, rigidBody);

        // Store references
        this.rigidBodies.set(mesh, rigidBody);
        this.colliders.set(mesh, collider);
    }

    // Create a static rigid body (not affected by physics, but objects can collide with it)
    createStaticBody(
        mesh: THREE.Mesh,
        vertices: Float32Array,
        indices: Uint32Array
    ): void {
        if (!this.world) throw new Error('Physics not initialized');

        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
            .setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
            .setRotation(mesh.quaternion);

        const rigidBody = this.world.createRigidBody(rigidBodyDesc);

        // Create trimesh collider from mesh geometry
        const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices);
        const collider = this.world.createCollider(colliderDesc, rigidBody);

        this.rigidBodies.set(mesh, rigidBody);
        this.colliders.set(mesh, collider);
    }

    // Remove physics body
    removeBody(mesh: THREE.Mesh): void {
        if (!this.world) return;

        const rigidBody = this.rigidBodies.get(mesh);
        if (rigidBody) {
            this.world.removeRigidBody(rigidBody);
            this.rigidBodies.delete(mesh);
        }

        this.colliders.delete(mesh);
    }

    // Step the physics simulation
    step(deltaTime: number): void {
        if (!this.world) return;

        // Step physics (with fixed timestep for stability)
        this.world.step();

        // Sync Three.js meshes with Rapier rigid bodies
        this.rigidBodies.forEach((rigidBody, mesh) => {
            const position = rigidBody.translation();
            const rotation = rigidBody.rotation();

            mesh.position.set(position.x, position.y, position.z);
            mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        });
    }

    // Apply an impulse to a body
    applyImpulse(mesh: THREE.Mesh, impulse: THREE.Vector3): void {
        const rigidBody = this.rigidBodies.get(mesh);
        if (rigidBody) {
            rigidBody.applyImpulse(impulse, true);
        }
    }

    // Set velocity
    setVelocity(mesh: THREE.Mesh, velocity: THREE.Vector3): void {
        const rigidBody = this.rigidBodies.get(mesh);
        if (rigidBody) {
            rigidBody.setLinvel(velocity, true);
        }
    }

    // Get all active bodies (for debugging/visualization)
    getActiveBodies(): THREE.Mesh[] {
        return Array.from(this.rigidBodies.keys());
    }
}

export const physicsManager = new PhysicsManager();