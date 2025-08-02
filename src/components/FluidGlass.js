/* eslint-disable react/no-unknown-property */
import * as THREE from 'three'
import { useRef, useState, useEffect, memo } from 'react'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text,
} from '@react-three/drei'
import { easing } from 'maath'

// Full component code here
[Rest of the code from your Fluid Glass file]
