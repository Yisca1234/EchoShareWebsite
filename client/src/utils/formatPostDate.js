import { formatDistanceToNow, format } from 'date-fns';

export const formatPostDate = (createdAt) => {
  const now = new Date();
  const postDate = new Date(createdAt);

  const timeDifference = now - postDate;

  // Check if the post was created less than 24 hours ago
  if (timeDifference < 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(postDate, { addSuffix: true }); // e.g., '6 hours ago'
  }


  // More than 24 hours ago
  const postYear = postDate.getFullYear();
  const currentYear = now.getFullYear();
  if(postYear===currentYear){
    return format(postDate, 'MMM dd'); 
  } else {
    return format(postDate, 'MMM dd yy'); 
  }
};

export const formatPostDate1 = (createdAt) => {
  const now = new Date();
  const postDate = new Date(createdAt);

  // More than 24 hours ago
  return format(postDate, `MMM dd ,yy`); // e.g., 'Jan 10, 21'
};
