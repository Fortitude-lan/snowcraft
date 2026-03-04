'use client'

import React, { Suspense, useMemo, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, useTexture, Decal } from '@react-three/drei'
import * as THREE from 'three'
import { clsx } from 'clsx'
const ENVIRONMENT_COLOR = "#969696";


const FINISH_OPTIONS: Record<string, { roughness: number; metalness: number }> = {
    matte: { roughness: 0.5, metalness: 0.2 },
    glossy: { roughness: 0.3, metalness: 0.3 },
}

interface CustomizerCanvasProps {
    typeId: string
    textureUrl: string
    finish?: string
    customText?: string
    /** When false, the second side (material2) uses black; when true, both sides use texture. */
    isDoubleSided?: boolean
    position?: [number, number, number]
    orbitControls?: boolean
    className?: string
    style?: React.CSSProperties
}

export function CartConvas({
    position = [2, 3.5, 4],
    orbitControls = true,
    typeId,
    textureUrl,
    finish = 'matte',
    customText = '',
    isDoubleSided = true,
    className,
    style,
}: CustomizerCanvasProps) {
    return (
        <div style={style} className={clsx("bg-transparent", className)}>
            <Canvas frameloop="demand" shadows camera={{ position, fov: 55 }} style={{ width: '100%', height: '100%' }}>
                <Suspense fallback={null}>
                    <Environment files="/hdr/warehouse-256.hdr" environmentIntensity={0.6} />

                    <directionalLight
                        castShadow
                        position={[2, 5, 2]}
                        intensity={2}
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                    />
                    <directionalLight

                        position={[-2, 0, -2]}
                        intensity={1.5}
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                    />
                    <fog attach="fog" args={[ENVIRONMENT_COLOR, 3, 20]} />
                    <color attach="background" args={[ENVIRONMENT_COLOR]} />

                    {/* FLOOR */}
                    <StageFloor />

                    {/* MODEL */}
                    <ProductModel
                        typeId={typeId}
                        textureUrl={textureUrl}
                        finish={finish}
                        customText={customText}
                        isDoubleSided={isDoubleSided}
                    />
                </Suspense>

                {/* CONTROL */}
                <OrbitControls
                    enabled={orbitControls}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2.2}
                />
            </Canvas>
        </div>
    )
}

interface ProductModelProps {
    textureUrl: string
    typeId: string
    finish?: string
    customText?: string
    isDoubleSided?: boolean
}

function setupTexture(tex: THREE.Texture) {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY = false
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1, 1)
    tex.anisotropy = 16
    tex.needsUpdate = true
}
const EDGE_MATERIAL_CONFIG = {
    black: { color: '#171717' },
    white: { color: '#f5f5f5' },
}

/** Creates a texture from text (canvas 2D → CanvasTexture). Caller must dispose when done. */
function createTextTexture(text: string): THREE.CanvasTexture | null {
    if (typeof document === 'undefined' || !text.trim()) return null
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = 'rgba(0,0,0,0.01)'
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#000'
    ctx.font = ' 30px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.trim(), size / 2, size / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
    return tex
}

function ProductModel({ textureUrl, typeId, finish = 'matte', customText = '', isDoubleSided = true }: ProductModelProps) {
    const { nodes } = useGLTF('/models/snowboard.glb') as any
    const { nodes: sharpNodes } = useGLTF('/models/snowboard_sharp.glb') as any
    const testTexture = useTexture(['/textures/test.png'])

    /* =======================
       TEXTURE
    ======================= */

    const textures = useTexture(textureUrl ? [textureUrl] : [])

    useMemo(() => {
        textures.forEach(setupTexture)
        testTexture.forEach(setupTexture)

    }, [textures, testTexture])

    /* =======================
       MATERIALS
    ======================= */

    // 1️⃣ 板面材质（贴图）
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

    // 3️⃣ 单面时的背面材质：双面时 back=front 都用 deckMaterial；单面时背面默认黑
    const backMaterial = useMemo(() => {
        if (isDoubleSided) return null // 双面时背面与正面一致，渲染里 _2 会用 deckMaterial
        return new THREE.MeshStandardMaterial({
            ...EDGE_MATERIAL_CONFIG.white,
            ...(FINISH_OPTIONS[finish] || FINISH_OPTIONS.matte),
        })
    }, [isDoubleSided, finish])

    /* =======================
       MESH GROUP SWITCH
    ======================= */

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
            case 'SB-004':
                return [
                    sharpNodes.snowboard_sharp_1,
                    sharpNodes.snowboard_sharp_2,
                    sharpNodes.snowboard_sharp_3,
                ]
            default:
                return []
        }
    }, [typeId, nodes, sharpNodes])

    /* =======================
       CUSTOM TEXT DECAL
    ======================= */
    const decalTexture = useMemo(
        () => createTextTexture(customText),
        [customText]
    )
    useEffect(() => {
        return () => {
            if (decalTexture) decalTexture.dispose()
        }
    }, [decalTexture])

    const deckMeshRef = useRef<THREE.Mesh>(null!)

    /* =======================
       RENDER
    ======================= */

    const firstDeckNode = groupNodes.find(
        (n) => n && !n.name.endsWith('_3') && !n.name.endsWith('_4')
    )

    return (
        <group position={[0, 0.473, 0]} rotation={[Math.PI / 2.3, 0, 0]}>
            {groupNodes.map((meshNode) => {
                if (!meshNode) return null

                const isEdge = meshNode.name.endsWith('_3') || meshNode.name.endsWith('_4')
                const isSecondDeck = meshNode.name.endsWith('_2')
                const isFirstDeck = meshNode === firstDeckNode

                let material = deckMaterial
                if (isEdge) material = edgeMaterial

                if (!isDoubleSided && isSecondDeck && backMaterial) material = backMaterial

                return (
                    <mesh
                        key={meshNode.name}
                        ref={isFirstDeck ? deckMeshRef : undefined}
                        geometry={meshNode.geometry}
                        material={material}
                        castShadow
                        receiveShadow
                    />
                )
            })}
            {/* Custom text decal on deck (aligned with board tilt) */}
            {decalTexture && (
                <Decal
                    mesh={deckMeshRef}
                    rotation={[-Math.PI / 3, 0, 0]}
                    map={decalTexture}
                />
            )}
        </group>
    )
}

useGLTF.preload(['/models/snowboard.glb', '/models/snowboard_sharp.glb'])


// FLOOR
function StageFloor() {
    const [diffuseMap, normalMap, roughMap, aoMap] = useTexture([
        "/snow_diff.jpg",
        "/snow_normal.png",
        "/snow_rough.png",
        "/snow_ao.jpg",
    ])

    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
    diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping

    normalMap.repeat.set(10, 10)
    diffuseMap.repeat.set(10, 10)
    roughMap.repeat.set(10, 10)
    aoMap.repeat.set(10, 10)

    const material = new THREE.MeshStandardMaterial({
        map: diffuseMap,
        normalMap,
        roughnessMap: roughMap,
        aoMap,
        roughness: 0.85,
        color: 0xffffff
    })

    return (
        <mesh
            receiveShadow
            position={[0, -0.005, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={material}
        >
            <circleGeometry args={[20, 32]} />
        </mesh>
    )
}
