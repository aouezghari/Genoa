import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

import FamilyTreeScreen from '../../../features/tabs/screens/FamilyTreeScreen';
import { useAuth } from '../../../features/auth/model/auth-context';

export default function AdminTreeRoute() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const userIdParam = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const ownerNameParam = Array.isArray(params.name) ? params.name[0] : params.name;

  if (!user?.isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  if (!userIdParam) {
    return <Redirect href="/(tabs)/advanced" />;
  }

  return (
    <FamilyTreeScreen
      adminTargetUserId={userIdParam}
      adminTreeOwnerName={ownerNameParam || ''}
    />
  );
}
