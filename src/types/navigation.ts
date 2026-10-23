import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  BreedList: undefined;
  BreedDetail: { breedId: string; breedName: string };
};

export type BreedListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'BreedList'
>;

export type BreedDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'BreedDetail'
>;
