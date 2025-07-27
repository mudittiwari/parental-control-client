import axios from "axios";
import { BASE_URL } from '../../constants/constants';

export const requestEntryExitFeature = async ({
  trackerPhone,
  trackeePhone,
  lat,
  lon,
  radiusKm,
  name,
  featureType,
  schedules = []
}) => {
  try {
    console.log(featureType)
    let featureTypeAPI = "";
    if (featureType === 'entry-exit') {
      featureTypeAPI = 'request-entry-exit';
    } else if (featureType === 'entry') {
      featureTypeAPI = 'request-entry';
    }
    else if (featureType === 'exit') {
      featureTypeAPI = 'request-exit';
    }
    else{
      return Promise.reject(new Error("Invalid feature type"));
    }

    const res = await axios.post(`${BASE_URL}/features/${featureTypeAPI}`, {
      name,
      trackeePhone,
      trackerPhone,
      lat,
      lon,
      radiusKm,
      schedules
    }, {
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
    });
    return res.data;
  } catch (error) {
    console.error('Request Entry-Exit Feature Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to request entry-exit feature'
    );
  }
};