/**
 * CellDetailModal — tap any square to inspect it.
 *
 * Shows the square number, its Sanskrit (Devanagari) and English names, and any
 * snake/ladder connections — including off-board realms (नरक / महानरक / लोक)
 * that some snakes and ladders lead to.
 */
import React, { useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/constants';
import {
  endpointLabel,
  getCellConnections,
  type CellConnection,
} from '@/data';
import type { BoardCell } from '@/types';

interface CellDetailModalProps {
  cell: BoardCell | null;
  onClose: () => void;
}

/** One human-readable line for a snake/ladder connection. */
function describeConnection(conn: CellConnection): string {
  const verb = conn.kind === 'snake' ? 'Snake' : 'Ladder';
  if (conn.role === 'start') {
    const action = conn.kind === 'snake' ? 'slides down to' : 'climbs up to';
    return `${verb} ${action} ${endpointLabel(conn.to)}`;
  }
  const origin = conn.kind === 'snake' ? 'tail of snake from' : 'top of ladder from';
  return `${verb} — ${origin} ${endpointLabel(conn.from)}`;
}

const CellDetailModalComponent: React.FC<CellDetailModalProps> = ({
  cell,
  onClose,
}) => {
  const connections = useMemo(
    () => (cell ? getCellConnections(cell.id) : []),
    [cell],
  );

  return (
    <Modal
      visible={cell !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close square details">
        {cell ? (
          // Inner TouchableOpacity (activeOpacity 1, no-op) blocks backdrop taps.
          <TouchableOpacity
            activeOpacity={1}
            style={styles.card}
            accessibilityViewIsModal>
            <Text style={styles.number}>Square {cell.id}</Text>
            {cell.sanskrit ? (
              <Text style={styles.sanskrit}>{cell.sanskrit}</Text>
            ) : null}
            <Text style={styles.english}>{cell.title}</Text>

            {connections.length > 0 ? (
              <View style={styles.connections}>
                {connections.map((conn, i) => (
                  <View
                    key={`${conn.kind}-${conn.role}-${i}`}
                    style={styles.connectionRow}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            conn.kind === 'snake' ? colors.snake : colors.ladder,
                        },
                      ]}
                    />
                    <Text style={styles.connectionText}>
                      {describeConnection(conn)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.plain}>No snakes or ladders here.</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Text style={styles.buttonLabel}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.copper,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  number: {
    fontSize: typography.fontSize.sm,
    color: colors.gold,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sanskrit: {
    fontSize: typography.fontSize.xxl,
    color: colors.ivory,
    fontFamily: typography.fontFamily.devanagari,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  english: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  connections: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.primary,
  },
  plain: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.primary,
  },
  button: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.maroon,
    borderWidth: 1,
    borderColor: colors.copper,
  },
  buttonLabel: {
    fontSize: typography.fontSize.md,
    color: colors.ivory,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
});

export const CellDetailModal = React.memo(CellDetailModalComponent);
CellDetailModal.displayName = 'CellDetailModal';
