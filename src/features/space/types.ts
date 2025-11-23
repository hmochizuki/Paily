import type { ReplaceDateWithString } from "@/types/replace-date-with-string";

interface SpaceCore {
  id: string;
  createdAt: Date;
  partners: Array<{
    profile: {
      displayName: string;
    };
  }>;
}

export type SpaceDto = ReplaceDateWithString<SpaceCore>;
export type SpaceViewModel = SpaceCore;

function toSpaceViewModel(dto: SpaceDto): SpaceViewModel {
  const { createdAt, ...rest } = dto;
  return {
    ...rest,
    createdAt: new Date(createdAt),
  };
}

export function toSpaceViewModels(dtos: SpaceDto[]): SpaceViewModel[] {
  return dtos.map((dto) => toSpaceViewModel(dto));
}
