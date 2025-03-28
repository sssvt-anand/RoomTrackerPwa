// src/components/Members/MemberList.js
import React from 'react';
import MemberItem from './MemberItem';

const MembersList = ({ members, loading }) => {
  if (loading) return <div>Loading members...</div>;

  return (
    <div>
      <h2>Members</h2>
      {members.map(member => (
        <MemberItem key={member.id} member={member} />
      ))}
    </div>
  );
};

export default MembersList;