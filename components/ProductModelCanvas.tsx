'use client'

interface ProductModelInnerProps {
    textureUrls: string[] | undefined
    assetCode: string,
    finish?: string
}

import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { clsx } from 'clsx'


const ENVIRONMENT_COLOR = "#969696";


const FINISH_OPTIONS: Record<string, { roughness: number; metalness: number }> = {
    matte: { roughness: 0.5, metalness: 0.2 },
    glossy: { roughness: 0.3, metalness: 0.3 },
}
const EDGE_MATERIAL_CONFIG = {
    black: { color: '#171717' },
    white: { color: '#f5f5f5' },
}


export function ProductModelCanvas({
    position = [0, 0, 5],
    orbitControls = true,
    finish = 'matte',
    assetCode,
    textureUrls,
    className,
    style,
    ...data
}: any): React.ReactElement {


    return (
        <div style={style} className={clsx("bg-transparent", className)}>
            <Canvas frameloop="demand" style={{ width: '100%', height: '100%' }}
                camera={{ position: position, fov: 55 }}>
                <Suspense fallback={
                    <mesh visible={false}>
                        <planeGeometry args={[1, 1]} />
                        <meshBasicMaterial color="#fff" opacity={0} /> {/* Tailwind bg-gray-200 */}
                    </mesh>}>
                    {/* <Environment preset="city" /> */}
                    <Environment
                        files={"/hdr/warehouse-256.hdr"}
                        environmentIntensity={0.6}
                    />
                    <directionalLight
                        castShadow
                        lookAt={[0, 0, 0]}
                        position={[1, 1, 1]}
                        intensity={1.6}
                    />

                    {/* Model */}
                    <ProductModel
                        assetCode={assetCode}
                        textureUrls={textureUrls}
                        finish={finish}
                    />
                </Suspense>
                <OrbitControls enabled={orbitControls} />
            </Canvas>
        </div>
    )
}


export function ProductModel({ textureUrls, assetCode, finish = 'matte' }: ProductModelInnerProps) {
    const { nodes } = useGLTF('/models/snowboard.glb')
    const { nodes: nodes2 } = useGLTF('/models/snowboard_sharp.glb')
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

    const deckMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            ...(FINISH_OPTIONS[finish] || FINISH_OPTIONS.matte),
            map: textures[0] || null,
        })
    }, [finish, textures])
    // 2️⃣ 边缘材质（固定黑）
    const edgeMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            ...EDGE_MATERIAL_CONFIG.black,
            ...(FINISH_OPTIONS[finish] || FINISH_OPTIONS.matte),
        })
    }, [finish])

    const material = new THREE.MeshStandardMaterial({
        map: textures[0] || null,
        ...FINISH_OPTIONS.glossy
    })
    // 选择 mesh 组
    const groupNodes = useMemo(() => {
        switch (assetCode) {
            case 'SB-001': return [nodes.snowboard_camber_1, nodes.snowboard_camber_2, nodes.snowboard_camber_3, nodes.snowboard_camber_4]
            case 'SB-002': return [nodes.snowboard_flat_1, nodes.snowboard_flat_2, nodes.snowboard_flat_3, nodes.snowboard_flat_4]
            case 'SB-003': return [nodes.snowboard_rocker_1, nodes.snowboard_rocker_2, nodes.snowboard_rocker_3, nodes.snowboard_rocker_4]
            case 'SB-004': return [nodes2.snowboard_sharp_1, nodes2.snowboard_sharp_2, nodes2.snowboard_sharp_3]
            default: return []
        }
    }, [assetCode, nodes, nodes2])

    // 返回 mesh 列表
    return (
        <group position={[0, 0, 0]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
            {/* <mesh rotateX={Math.PI / 2}>
                <planeGeometry args={[1, 1, 1]} />
                <meshStandardMaterial map={textures[0]} />
            </mesh> */}
            {groupNodes.map((meshNode, idx) => {

                // 对应顺序替换贴
                if (!meshNode) return null
                const mesh = meshNode as THREE.Mesh
                const isEdge = meshNode.name.endsWith('_3') || meshNode.name.endsWith('_4')
                let material = deckMaterial
                if (isEdge) material = edgeMaterial
                return (
                    <mesh
                        key={meshNode.name}
                        geometry={mesh.geometry}
                        material={material}
                    >
                    </mesh>
                )
            })}
        </group>
    )
}

useGLTF.preload(['/models/snowboard.glb', '/models/snowboard_sharp.glb'])

