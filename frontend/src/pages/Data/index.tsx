import React from 'react';
import CohortCard from './CohortCard';
import SubjectCard from './SubjectCard';
import UploadDataCard from './UploadDataCard';
import PageContainer from '../../containers/PageContainer';

const DataPage: React.FC = () => {
  return (
    <PageContainer title={"Data"} gap={10}>
      <CohortCard />
      <SubjectCard />
      <UploadDataCard />
    </PageContainer>   
  )
}

export default DataPage;