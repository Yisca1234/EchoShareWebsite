import { useDispatch, useSelector } from 'react-redux';
import {handleFollow, } from '../redux/user/actions.js';


// export function shuffleArray(array) {
//   return array.sort(() => Math.random() - 0.5);
// }

export const handleFollowButton = async (idFollower, idChannel, follow) => {
  const dispatch = useDispatch();
  await dispatch(handleFollow(idFollower, idChannel, follow));
}



