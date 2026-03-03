// src/components/CardComponent.tsx
import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import { CardData } from '../../types/CardComponent';

interface Props {
  data: CardData;
}

const CardComponent: React.FC<Props> = ({ data }) => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        width: '100%', 
      }}
    >
      <Box
        sx={{
          width: { xs: 60, sm: 80 },   
          height: { xs: 60, sm: 80 },
          bgcolor: '#FFD700',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: { xs: 20, sm: 24 },
        }}
      >
        {data.icon}
      </Box>

      <Box textAlign={{ xs: 'center', sm: 'left' }}>
        <Typography variant="h6">{data.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {data.content}
        </Typography>
      </Box>
    </Card>
  );
};

export default CardComponent;
