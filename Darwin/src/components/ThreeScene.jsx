import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ThreeScene = ({ className }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        let animationFrameId;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x202025);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.6), 0.1, 1000);
        camera.position.set(0, 2, 7);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.setSize(window.innerWidth, window.innerHeight * 0.6);

        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const modelPaths = [
            '/panda.fbx',
            '/baboon.fbx',
            '/wolf.fbx',
            '/tiger.glb',
            '/roger.fbx'
        ];

        const loadedModels = [];
        let currentModel = null;
        let mixer = null;
        let modelIndex = 0;
        let intervalId = null;

        const fbxLoader = new FBXLoader();
        const gltfLoader = new GLTFLoader();

        function loadAndPrepareModel(path) {
            return new Promise((resolve, reject) => {
                const isGLB = path.includes('.glb');
                const loader = isGLB ? gltfLoader : fbxLoader;

                loader.load(path, (result) => {
                    const object = isGLB ? result.scene : result;
                    object.userData.animations = isGLB ? result.animations : object.animations;

                    object.scale.set(1, 1, 1);
                    const box = new THREE.Box3().setFromObject(object);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scaleFactor = maxDim > 0 ? 5 / maxDim : 1;
                    object.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    const scaledBox = new THREE.Box3().setFromObject(object);
                    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
                    object.position.x = -scaledCenter.x;
                    object.position.y = -scaledBox.min.y;
                    object.position.z = -scaledCenter.z;

                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            const materials = Array.isArray(child.material) ? child.material : [child.material];
                            materials.forEach(m => { if (m) m.side = THREE.DoubleSide; });
                        }
                    });

                    resolve(object);
                }, undefined, reject);
            });
        }

        function cycleModel() {
            if (loadedModels.length === 0) return;
            if (currentModel) scene.remove(currentModel);
            if (mixer) { mixer.stopAllAction(); mixer = null; }

            currentModel = loadedModels[modelIndex];
            scene.add(currentModel);

            if (currentModel.userData.animations && currentModel.userData.animations.length > 0) {
                mixer = new THREE.AnimationMixer(currentModel);
                const action = mixer.clipAction(currentModel.userData.animations[0]);
                action.play();
                action.timeScale = 1.0;
            }
            modelIndex = (modelIndex + 1) % loadedModels.length;
        }

        async function initModels() {
            try {
                const results = await Promise.all(modelPaths.map(p =>
                    loadAndPrepareModel(p).catch(() => null)
                ));

                if (!isMounted) return;

                const valid = results.filter(m => m !== null);
                if (valid.length > 0) {
                    loadedModels.push(...valid);
                    cycleModel();
                    if (intervalId) clearInterval(intervalId);
                    intervalId = setInterval(cycleModel, 3000);
                }
            } catch (error) {
                console.error(error);
            }
        }

        initModels();

        const clock = new THREE.Clock();

        function animate() {
            if (!isMounted) return;
            animationFrameId = requestAnimationFrame(animate);

            const delta = clock.getDelta();
            if (mixer) mixer.update(delta);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width && height) {
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height);
                }
            }
        });

        if (mountRef.current) {
            resizeObserver.observe(mountRef.current);
        }

        return () => {
            isMounted = false;
            resizeObserver.disconnect();
            if (intervalId) clearInterval(intervalId);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%', position: 'relative' }} />;
};

export default ThreeScene;
