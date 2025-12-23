
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EllipsoidParams } from '../App';
import { Line } from '@react-three/drei';

interface Props {
  params: EllipsoidParams;
}

export const EllipsoidScene: React.FC<Props> = ({ params }) => {
  const { a, b, c, theta } = params;
  const thetaRad = (theta * Math.PI) / 180;

  // Ellipsoid Geometry
  const ellipsoidMesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    // Standard ellipsoid: x²/a² + y²/b² + z²/c² = 1
    // Scale unit sphere: x -> a, y -> b, z -> c
    geometry.scale(a, b, c);
    return geometry;
  }, [a, b, c]);

  // Plane Geometry (Over x-axis)
  // Plane equation: y*sin(theta) - z*cos(theta) = 0
  const planeSize = Math.max(a, b, c) * 2.5;
  const planeRef = useRef<THREE.Group>(null);

  // Intersection Curve Calculation
  // Plane passes through X-axis. Let local coordinates on plane be (u, v)
  // x = u
  // y = v * cos(theta)
  // z = v * sin(theta)
  // Sub into ellipsoid: u²/a² + (v*cosθ)²/b² + (v*sinθ)²/c² = 1
  // u²/a² + v² [ (cos²θ)/b² + (sin²θ)/c² ] = 1
  // Semi-axes of the intersection ellipse:
  // a_int = a
  // b_int = 1 / sqrt( (cos²θ)/b² + (sin²θ)/c² )
  const intersectionPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const a_int = a;
    const inv_b_int_sq = (Math.cos(thetaRad) ** 2) / (b * b) + (Math.sin(thetaRad) ** 2) / (c * c);
    const b_int = Math.sqrt(1 / inv_b_int_sq);

    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const phi = (i / segments) * Math.PI * 2;
      const u = a_int * Math.cos(phi);
      const v = b_int * Math.sin(phi);
      
      // Transform local (u, v) to global (x, y, z)
      const x = u;
      const y = v * Math.cos(thetaRad);
      const z = v * Math.sin(thetaRad);
      points.push([x, y, z]);
    }
    return points;
  }, [a, b, c, thetaRad]);

  // Is it roughly circular?
  const isCircular = useMemo(() => {
    const inv_b_int_sq = (Math.cos(thetaRad) ** 2) / (b * b) + (Math.sin(thetaRad) ** 2) / (c * c);
    const b_int = Math.sqrt(1 / inv_b_int_sq);
    return Math.abs(a - b_int) < 0.05;
  }, [a, b, c, thetaRad]);

  return (
    <group>
      {/* The Ellipsoid */}
      <mesh geometry={ellipsoidMesh}>
        <meshStandardMaterial 
          color="#818cf8" 
          transparent 
          opacity={0.3} 
          wireframe={false} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Wireframe overlay for the ellipsoid */}
      <mesh geometry={ellipsoidMesh}>
        <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.1} />
      </mesh>

      {/* The Intersecting Plane */}
      <group rotation={[thetaRad, 0, 0]}>
        <mesh>
          <planeGeometry args={[planeSize, planeSize]} />
          <meshStandardMaterial 
            color="#ec4899" 
            transparent 
            opacity={0.15} 
            side={THREE.DoubleSide} 
          />
        </mesh>
        {/* Plane outline */}
        <Line 
          points={[
            [-planeSize/2, -planeSize/2, 0],
            [planeSize/2, -planeSize/2, 0],
            [planeSize/2, planeSize/2, 0],
            [-planeSize/2, planeSize/2, 0],
            [-planeSize/2, -planeSize/2, 0]
          ]} 
          color="#ec4899" 
          lineWidth={1} 
          opacity={0.5} 
          transparent
        />
      </group>

      {/* The Intersection Line */}
      <Line 
        points={intersectionPoints as any} 
        color={isCircular ? "#10b981" : "#f43f5e"} 
        lineWidth={isCircular ? 4 : 2} 
        dashed={false}
      />

      {/* Coordinate Axes */}
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 10, 0xef4444)} />
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 10, 0x22c55e)} />
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 10, 0x3b82f6)} />
    </group>
  );
};
