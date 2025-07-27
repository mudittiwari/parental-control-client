import * as Contacts from 'expo-contacts';
import { saveMatchedContacts } from './localStorage';
import axios from 'axios';
import { getUser } from './localStorage';
import { BASE_URL } from '../constants/constants';

export const getContacts = async () => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access contacts denied');
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    });

    const phoneNumbers = data
      .flatMap(contact =>
        contact.phoneNumbers?.map(p => {
          let cleaned = p.number.replace(/\s+/g, '').replace(/[^+\d]/g, '');
          if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
          return cleaned;
        }) || []
      )
      .filter((num, idx, arr) => num && arr.indexOf(num) === idx);

    const lookupResponse = await axios.post(`${BASE_URL}/users/lookup`, {
      phoneNumbers,
    }, {
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
    });
    const matchedContacts = lookupResponse.data || [];
    const currentUser = getUser();

    if (!currentUser || !currentUser.phoneNumber) {
      throw new Error('Current user not found in storage');
    }
    const enrichedContacts = await Promise.all(
      matchedContacts.map(async (contact) => {
        try {
          const featuresRes = await axios.post(`${BASE_URL}/features/between`, {
            user1: currentUser.phoneNumber,
            user2: contact.phoneNumber,
          }, {
            headers: {
              'Content-Type': 'application/json',
              "ngrok-skip-browser-warning": "true"
            },
          });

          return {
            ...contact,
            features: featuresRes.data || [],
          };
        } catch (err) {
          console.warn(`Failed to fetch features for ${contact.phoneNumber}:`, err.message);
          return {
            ...contact,
            features: [],
          };
        }
      })
    );
    console.log('Matched Contacts:', JSON.stringify(enrichedContacts, null, 2));
    saveMatchedContacts(enrichedContacts);
    return enrichedContacts;
  } catch (error) {
    console.error('Error in getContacts:', error);
    throw new Error(error.message || 'Failed to fetch and match contacts');
  }
};
