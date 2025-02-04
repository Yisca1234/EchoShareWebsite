import { useState, useEffect } from "react";
import apiClient from '../utils/apiClient.js'
import { useSelector } from 'react-redux';
import { getUserId } from '../redux/user/selectors.js';
import { Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SearchBox = ({ channels }) => {
  const [query, setQuery] = useState("");
  const [filteredChannels, setFilteredChannels] = useState([]);
  const userId = useSelector(getUserId);
  const navigate = useNavigate();
  const cloud_name = "dojexlq8y";


  useEffect(() => {
    if (query.trim() === "") {
      setFilteredChannels([]);
      return;
    }
    const getResults = async () => {
      const response = await apiClient.get(`user/search/${query}/${userId}`);
      setFilteredChannels([...response.data.channels]);
    };
    getResults();
  }, [query]);

  const navigateToChannel = (_id) => {
    navigate(`/channel/${_id}`);
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a channel..."
        className="search"
      />
      <div className="mt-2 box14">
        {filteredChannels.length > 0 ? (
          filteredChannels.map(channel => (
            <div key={channel._id} className="p-2 border-b line3" onClick={()=>{navigateToChannel(channel._id)}}>
              <Image src={channel.avatar.imageLink ? `https://res.cloudinary.com/${cloud_name}/image/upload/${channel.avatar.imageLink}` : 'account.png'} fluid style={{borderRadius: '50%', width: '35px', height: '35px', objectFit: 'cover' }} />
              <div >{channel.avatar.username}</div>
            </div>
          ))
        ) : query.trim() !== "" && (
          <p className="text-gray-500">No matching channels found</p>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
