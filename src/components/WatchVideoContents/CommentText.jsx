import { useEffect, useRef } from "react";
import Konva from "konva";
import { Group, Text } from "react-konva";

// コメントコンポーネント
export const DURATION_SECONDS = 5;

export const CommentText = ({ isMobile, ...props }) => {
  const groupRef = useRef(null);
  const tweenRef = useRef(null);
  const strokeWidth = isMobile ? 0.5 : 1;
  
  useEffect(() => {
    tweenRef.current = new Konva.Tween({
      node: groupRef.current,
      x: -groupRef.current.findOne('Text').textWidth,
      duration: DURATION_SECONDS,
      onFinish: () => {
        if (groupRef.current) groupRef.current.destroy();
      }
    });
  }, [groupRef]);

  useEffect(() => {
    if (tweenRef === null) return;
    props.isPlaying ? tweenRef.current.play() : tweenRef.current.pause();
  }, [props.isPlaying, tweenRef]);

  // アウトライン効果のためのオフセット（8方向）
  const outlineOffsets = [
    { x: -strokeWidth, y: -strokeWidth },
    { x: 0, y: -strokeWidth },
    { x: strokeWidth, y: -strokeWidth },
    { x: -strokeWidth, y: 0 },
    { x: strokeWidth, y: 0 },
    { x: -strokeWidth, y: strokeWidth },
    { x: 0, y: strokeWidth },
    { x: strokeWidth, y: strokeWidth }
  ];

  return (
    <Group
      ref={groupRef}
      x={props.x}
      y={props.y}
      visible={props.visible}
      opacity={props.opacity}
    >
      {/* アウトライン用の黒いテキスト（8方向に描画） */}
      {outlineOffsets.map((offset, index) => (
        <Text
          key={`outline-${index}`}
          text={props.text}
          x={offset.x}
          y={offset.y}
          fontSize={props.fontSize}
          fontStyle={props.fontStyle}
          fill="black"
          lineHeight={props.line === 1 ? 1 : 1.35}
        />
      ))}
      {/* メインのテキスト */}
      <Text
        text={props.text}
        x={0}
        y={0}
        fontSize={props.fontSize}
        fontStyle={props.fontStyle}
        fill={props.fill}
        lineHeight={props.line === 1 ? 1 : 1.35}
      />
    </Group>
  )
}

