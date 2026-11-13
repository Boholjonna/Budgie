import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Colors from '../constants/colors';

interface Slice {
  value: number;
  color: string;
}

interface Props {
  slices:        Slice[];
  total:         number;
  spentPercent:  number;
  size?:         number;
  strokeWidth?:  number;
}

export default function DonutChart({
  slices,
  total,
  spentPercent,
  size        = 160,
  strokeWidth = 20,
}: Props) {
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Build arc segments
  let cumulativePercent = 0;

  const segments = slices
    .filter((s) => s.value > 0 && total > 0)
    .map((slice) => {
      const pct    = slice.value / total;
      const offset = circumference * (1 - cumulativePercent);
      const dash   = circumference * pct;
      cumulativePercent += pct;
      return { ...slice, dash, offset };
    });

  const pctLabel = `${Math.round(spentPercent * 100)}%`;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={Colors.border}
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        <G rotation="-90" origin={`${cx},${cy}`}>
          {segments.map((seg, i) => (
            <Circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${circumference}`}
              strokeDashoffset={-circumference + seg.offset}
              strokeLinecap="round"
            />
          ))}
        </G>
      </Svg>
      {/* Center label */}
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.pctText}>{pctLabel}</Text>
        <Text style={styles.pctLabel}>spent</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  pctText: {
    fontSize:   26,
    fontWeight: '800',
    color:      Colors.text,
    lineHeight: 30,
  },
  pctLabel: {
    fontSize: 11,
    color:    Colors.muted,
    marginTop: 2,
  },
});
