import React from 'react';
import { G, Rect, Text as SvgText } from 'react-native-svg';
import { NODE_W, NODE_H } from '../utils/treeUtils';


export default function PersonCard({ x, y, person, isSelected, onPress }) {
  const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ').trim() || person.name || 'Inconnu';
  const isFemale = person.gender === 'female';
  const cardColor = isFemale ? '#DB2777' : '#2563EB';
  const darkColor = isFemale ? '#9D174D' : '#1D4ED8';
  const label = fullName.length > 20 ? fullName.slice(0, 19) + '\u2026' : fullName;

  return (
    <G onPress={() => onPress(person)}>
      <Rect
        x={x - NODE_W / 2 + 3}
        y={y - NODE_H / 2 + 5}
        width={NODE_W}
        height={NODE_H}
        rx={16}
        fill="rgba(0,0,0,0.14)"
      />
      <Rect
        x={x - NODE_W / 2}
        y={y - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={16}
        fill={cardColor}
        stroke={isSelected ? '#FCD34D' : darkColor}
        strokeWidth={isSelected ? 4 : 1.5}
      />
      <Rect
        x={x - NODE_W / 2}
        y={y - NODE_H / 2}
        width={NODE_W}
        height={NODE_H * 0.55}
        rx={16}
        fill="rgba(255,255,255,0.15)"
      />
      <SvgText x={x} y={y + 5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="white">
        {label}
      </SvgText>
      {isSelected && (
        <Rect
          x={x - NODE_W / 2 - 5}
          y={y - NODE_H / 2 - 5}
          width={NODE_W + 10}
          height={NODE_H + 10}
          rx={21}
          fill="none"
          stroke="#FCD34D"
          strokeWidth={3}
          strokeDasharray={[7, 4]}
        />
      )}
    </G>
  );
}
