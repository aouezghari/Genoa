import { StyleSheet } from 'react-native';

export const editMemberModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  kav: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  kavDesktop: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 16,
    maxHeight: '92%',
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 26,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 0,
    marginLeft: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  gRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  gIcon: {
    marginRight: 6,
  },
  gLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 24,
    marginBottom: 8,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIcon: {
    marginRight: 8,
  },
  saveTxt: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelTxt: {
    fontSize: 14,
    color: '#6B7280',
  },
});
