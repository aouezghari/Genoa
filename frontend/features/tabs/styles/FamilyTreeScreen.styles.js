import { StyleSheet } from 'react-native';

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};

export const familyTreeStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  hTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  hSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },
  selPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2F7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  selClose: {
    fontSize: 15,
    color: '#6B7280',
  },
  fabCol: {
    position: 'absolute',
    right: 12,
    bottom: 62,
    gap: 8,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECEEF2',
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legTxt: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  hint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  actionSub: {
    marginTop: 4,
    marginBottom: 14,
    color: '#6B7280',
    fontSize: 13,
  },
  actionBtnPrimary: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionBtnPrimaryDisabled: {
    backgroundColor: '#E5E7EB',
  },
  actionBtnPrimaryTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionBtnPrimaryTxtDisabled: {
    color: '#9CA3AF',
  },
  actionBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  actionBtnTxt: {
    color: '#111827',
    fontWeight: '700',
  },
  actionBtnTxtDisabled: {
    color: '#9CA3AF',
  },
  actionBtnDanger: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionBtnDangerTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionBtnDangerTxtDisabled: {
    color: '#E5E7EB',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnIcon: {
    marginRight: 8,
  },
  actionCancel: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionCancelTxt: {
    color: '#6B7280',
    fontWeight: '600',
  },
  deleteWarn: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  infoName: {
    marginTop: 4,
    marginBottom: 16,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 10,
  },
  infoCloseBtn: {
    marginTop: 14,
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  infoCloseTxt: {
    color: '#fff',
    fontWeight: '700',
  },
});
