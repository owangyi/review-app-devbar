export interface BranchGroup {
  main: string[];
  feature: string[];
}

export interface EnvironmentsData {
  frontend: BranchGroup;
  backend: BranchGroup;
}

export interface BranchSelectorProps {
  type: 'frontend' | 'backend';
  currentBranch: string;
  branches: BranchGroup;
  onSwitch: (branchName: string) => void;
}

export interface MetadataProps {
  pipelineId: string;
  deployTime: string;
}

