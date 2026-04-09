import { Button, Text, View } from 'react-native';
import { styles } from '../styles';

export function Card(props: { children: React.ReactNode }) {
  return <View style={styles.card}>{props.children}</View>;
}

export function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      {props.children}
    </View>
  );
}

export function MetricCard(props: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{props.label}</Text>
      <Text style={styles.metricValue}>{props.value}</Text>
    </View>
  );
}

export function InfoRow(props: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{props.label}</Text>
      <Text style={styles.infoValue}>{props.value}</Text>
    </View>
  );
}

export function ActionSection(props: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.actionSection}>
      <Text style={styles.actionSectionTitle}>{props.title}</Text>
      <Text style={styles.actionSectionDescription}>{props.description}</Text>
      {props.children}
    </View>
  );
}

export function ActionTile(props: {
  title: string;
  caption: string;
  onPress: () => void | Promise<void>;
}) {
  return (
    <View style={styles.actionTile}>
      <Text style={styles.actionTitle}>{props.title}</Text>
      <Text style={styles.actionCaption}>{props.caption}</Text>
      <Button title={props.title} onPress={props.onPress} />
    </View>
  );
}

export function ResultPanel(props: {
  title: string;
  value: string;
  accent: string;
  textTestID?: string;
}) {
  return (
    <View style={[styles.resultPanel, { borderLeftColor: props.accent }]}>
      <Text style={styles.resultLabel}>{props.title}</Text>
      <Text testID={props.textTestID} style={styles.resultValue}>
        {props.title}: {props.value}
      </Text>
    </View>
  );
}
