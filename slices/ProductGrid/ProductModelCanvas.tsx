'use client'

interface ProductModelInnerProps {
    textureUrls: string[] | undefined
    typeId: string
}

import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { clsx } from 'clsx'

const ENVIRONMENT_COLOR = "#969696";
const FINISH_OPTIONS = {
    matte: {
        roughness: 0.5,
        metalness: 0.2,
    },
    glossy: {
        roughness: 0.3,
        metalness: 0.2,
    },
}


export function ProductModelCanvas({
    camera_position = [2, 3, 4],
    orbitControls = true,
    type,
    asset_code,
    texture_urls,
    className,
    style,
    ...data
}: any): React.ReactElement {

    console.log(texture_urls, asset_code)
    return (
        <div style={style} className={clsx("bg-transparent", className)}>
            <Canvas frameloop="demand"
                style={{ width: '100%', height: '100%' }}
                camera={{ position: camera_position, fov: 55 }}>

                {/* <ambientLight intensity={1.5} /> */}
                {/* <directionalLight position={[0, 5, 6]} intensity={5} color={'#ccc'} /> */}
                <Suspense fallback={<mesh visible={false}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial color="#fff" /> {/* Tailwind bg-gray-200 */}
                </mesh>}>
                    {/* <Environment preset="city" /> */}
                    <Environment
                        files={"/hdr/warehouse-512.hdr"}
                        environmentIntensity={0.6}
                    />
                    <directionalLight
                        castShadow
                        lookAt={[0, 0, 0]}
                        position={[1, 1, 1]}
                        intensity={1.6}
                    />
                    <fog attach="fog" args={[ENVIRONMENT_COLOR, 3, 30]} />
                    <color attach="background" args={[ENVIRONMENT_COLOR]} />
                    <StageFloor />
                    <ProductModel
                        textureUrls={texture_urls[`${asset_code}`] || []}
                        typeId={asset_code}

                    />
                </Suspense>
                <OrbitControls enabled={orbitControls} />
            </Canvas>
        </div>
    )
}


export function ProductModel({ textureUrls, typeId }: ProductModelInnerProps) {
    const { nodes, materials } = useGLTF('/models/snowboard.glb')

    // 根据 textureUrls 动态生成 texture
    const textures = useTexture(textureUrls || [])

    // 可选：统一贴图参数
    textures.forEach((tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.flipY = false
        tex.needsUpdate = true
        tex.flipY = false; // Adjust if your texture appears upside down
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 1);
        tex.anisotropy = 16;
    })
    const material = new THREE.MeshStandardMaterial({
        ...FINISH_OPTIONS.matte,
        map: textures[0] || null,
    });
    // 选择 mesh 组
    const groupNodes = useMemo(() => {
        switch (typeId) {
            case 'SB-001':
                return [
                    nodes.snowboard_camber_1,
                    nodes.snowboard_camber_2,
                    nodes.snowboard_camber_3,
                    nodes.snowboard_camber_4,
                ]
            case 'SB-002':
                return [
                    nodes.snowboard_flat_1,
                    nodes.snowboard_flat_2,
                    nodes.snowboard_flat_3,
                    nodes.snowboard_flat_4,
                ]
            case 'SB-003':
                return [
                    nodes.snowboard_rocker_1,
                    nodes.snowboard_rocker_2,
                    nodes.snowboard_rocker_3,
                    nodes.snowboard_rocker_4,
                ]
            default:
                return []
        }
    }, [typeId, nodes])

    // 返回 mesh 列表
    return (
        <group position={[0, 0.45, 0]} rotation={[Math.PI / 3, 0, 0]}>
            {/* <mesh rotateX={Math.PI / 2}>
                <planeGeometry args={[1, 1, 1]} />
                <meshStandardMaterial map={textures[0]} />
            </mesh> */}
            {groupNodes.map((meshNode, idx) => {

                // 对应顺序替换贴
                if (!meshNode) return null
                const map = textures[0] || null
                const node = meshNode as THREE.Mesh
                return (
                    <mesh
                        key={node.name}
                        geometry={node.geometry}
                        material={material}
                    />
                )
            })}
        </group>
    )
}

useGLTF.preload('/models/snowboard.glb')

function StageFloor() {
    const normalMap = useTexture("/concrete-normal.avif");
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(30, 30);
    normalMap.anisotropy = 8;

    const material = new THREE.MeshStandardMaterial({
        roughness: 0.75,
        color: ENVIRONMENT_COLOR,
        normalMap: normalMap,
    });

    return (
        <mesh
            castShadow
            receiveShadow
            position={[0, -0.005, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={material}
        >
            <circleGeometry args={[20, 32]} />
        </mesh>
    );
}