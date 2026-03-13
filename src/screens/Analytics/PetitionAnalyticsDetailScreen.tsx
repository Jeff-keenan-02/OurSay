


export default function PetitionAnalyticsDetailScreen({ route }: any) {
  const { petitionId } = route.params;

  // Mock aggregated data
  const totalSupporters = 842;
  const totalEligible = 2000;

  const percentage = Math.round((totalSupporters / totalEligible) * 100);


}
