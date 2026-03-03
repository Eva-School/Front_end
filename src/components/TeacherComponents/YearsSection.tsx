"use client";
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { YearSection } from '../../types/YearsCard';

interface Props {
  data: YearSection;
}

const YearsCard: React.FC<Props> = ({ data }) => {
  const searchParams = useSearchParams();
  const year = searchParams?.get('year') || '';
  const subjectId = searchParams?.get('subject') || '';

  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: '#0f0f0f',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: "90%",
        minWidth: "1200px",
        color: '#fff',
         px: 3,
          py: 2,
      }}
    >
      {/* Header - Subject Name */}
      <Box
        sx={{
          backgroundColor: '#ffc600', 
           borderRadius: 2,
          px: 3,
          py: 2,
        }}
      >
        <Typography fontWeight="bold" variant="h6" color="#000">
          {data.title}
        </Typography>
        <Typography variant="caption" color="rgba(0, 0, 0, 0.7)">
          {data.items.length} class{data.items.length !== 1 ? 'es' : ''}
        </Typography>
      </Box>

      {/* Content - Classes List */}
      <Box>
        {data.items.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.8)', 
              
              px: 3,
              py: 2,
              borderBottom: index !== data.items.length - 1 ? '1px solid #e0e0e0' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.95)',
              },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography color="#000" fontWeight="600">
                Class: {item.name}
              </Typography>
            </Box>
            <Button
              component={Link}
              href={`/teacher/grade?classId=${item.id}&subject=${encodeURIComponent(
                data.title
              )}${year ? `&year=${year}` : ''}${
                subjectId ? `&subjectId=${subjectId}` : ''
              }`}
              size="small"
              variant="contained"
              sx={{
                backgroundColor: '#ffc600',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#ffc600',
                },
              }}
            >
              Grade Students
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default YearsCard;
