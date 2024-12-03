// src/Main.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './Main.css';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Main = () => {
  const { currentUser } = useAuth();
  const [fileContent, setFileContent] = useState('');
  const [numGifts, setNumGifts] = useState(1);
  const [occasion, setOccasion] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [giftCategory, setGiftCategory] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => setFileContent(e.target.result);
      reader.readAsText(file);
    } else {
      toast.error('Please upload a valid .txt file.');
    }
  };

  const handleSubmit = async () => {
    if (!fileContent) {
      toast.error('Please upload a chat file.');
      return;
    }
    if (numGifts < 1 || numGifts > 10) {
      toast.error('Number of gifts must be between 1 and 10.');
      return;
    }
    if (minBudget && isNaN(minBudget)) {
      toast.error('Minimum budget must be a number.');
      return;
    }
    if (maxBudget && isNaN(maxBudget)) {
      toast.error('Maximum budget must be a number.');
      return;
    }
    if (minBudget && maxBudget && Number(minBudget) > Number(maxBudget)) {
      toast.error('Minimum budget cannot be greater than maximum budget.');
      return;
    }

    setLoading(true);

    // Truncate the file content to avoid exceeding token limits
    const maxChatLength = 2000; // Adjust based on model's token limit
    const truncatedChat = fileContent.length > maxChatLength
      ? fileContent.substring(0, maxChatLength) + '...'
      : fileContent;

    // Build dynamic prompt based on optional fields
    let prompt = `
      Analyze the truncated WhatsApp chat below to identify preferences, interests, hobbies, and personality traits of the participants. Suggest ${numGifts} thoughtful gift ideas within a budget range of ${minBudget || 'any'} to ${maxBudget || 'any'} dollars. For each suggestion, include the product name, a brief explanation of its relevance, and a valid and functional URL to the product on Amazon.sa. Separate each gift suggestion with %%%.

      Example:
      Product Name: Echo Dot (4th Gen)
      Description: A smart speaker with Alexa, perfect for home automation enthusiasts.
      URL: https://www.amazon.sa/dp/B07FZ8S74R
      %%%
      Product Name: Kindle Paperwhite
      Description: Ideal for avid readers, offering a glare-free display.
      URL: https://www.amazon.sa/dp/B07CXG6C9W
      %%%
      
      Chat:
      ${truncatedChat}
    `;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4', // Ensure this model is available in your OpenAI account
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that suggests appropriate gifts based on WhatsApp chat history.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer YOUR_OPENAI_API_KEY_HERE`, // Replace with your API key for testing
          },
        }
      );

      // Process the response by splitting on %%%
      const rawSuggestions = response.data.choices[0].message.content;
      const splitSuggestions = rawSuggestions.split('%%%').map(suggestion => suggestion.trim()).filter(suggestion => suggestion !== '');

      // Further parse each suggestion into an object
      const parsedGifts = splitSuggestions.map((suggestion, index) => {
        const lines = suggestion.split('\n').map(line => line.trim());
        const gift = {
          id: index,
          productName: '',
          description: '',
          url: '',
          image: '',
        };

        lines.forEach(line => {
          if (line.startsWith('Product Name:')) {
            gift.productName = line.replace('Product Name:', '').trim();
          } else if (line.startsWith('Description:')) {
            gift.description = line.replace('Description:', '').trim();
          } else if (line.startsWith('URL:')) {
            gift.url = line.replace('URL:', '').trim();
          }
        });

        // Fetch an image based on the product name using Unsplash
        gift.image = `https://source.unsplash.com/featured/?gift,${encodeURIComponent(gift.productName.split(' ')[0])}`;

        return gift;
      });

      setGifts(parsedGifts);
      toast.success('Gift suggestions fetched successfully!');
    } catch (error) {
      if (error.response) {
        // The request was made, and the server responded with a status code outside 2xx
        console.error('Error response from OpenAI:', error.response.data);
        if (error.response.status === 429) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else if (error.response.status === 401) {
          toast.error('Unauthorized. Please check your API key.');
        } else {
          toast.error(`Error: ${error.response.data.error.message || 'Something went wrong.'}`);
        }
      } else if (error.request) {
        // The request was made, but no response was received
        console.error('No response received:', error.request);
        toast.error('No response from the server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up the request:', error.message);
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">{t('welcome')}, {currentUser.displayName}</h2>
      <div className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block mb-2 font-semibold">{t('uploadChat')}</label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-semibold">Occasion:</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Occasion (Optional)</option>
              <option value="Eid">Eid</option>
              <option value="Graduation">Graduation</option>
              <option value="Retirement">Retirement</option>
              <option value="Promotion">Promotion</option>
              <option value="Marriage">Marriage</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Recipient's Age Group:</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Age Group (Optional)</option>
              <option value="Child (0-12)">Child (0-12)</option>
              <option value="Teen (13-18)">Teen (13-18)</option>
              <option value="Adult (19-64)">Adult (19-64)</option>
              <option value="Senior (65+)">Senior (65+)</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Gift Category:</label>
            <select
              value={giftCategory}
              onChange={(e) => setGiftCategory(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Category (Optional)</option>
              <option value="Tech">Tech</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">{t('numberOfGifts')}</label>
            <input
              type="number"
              min="1"
              max="10"
              value={numGifts}
              onChange={(e) => setNumGifts(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">{t('minBudget')}</label>
            <input
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="Optional"
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">{t('maxBudget')}</label>
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Optional"
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? t('loading') : t('getSuggestions')}
        </button>
      </div>

      {/* Gift Suggestions */}
      {gifts.length > 0 && (
        <div className="gifts-container mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {gifts.map((gift) => (
            <div className="gift-card bg-white p-4 rounded shadow-md flex flex-col" key={gift.id}>
              <img src={gift.image} alt={gift.productName} className="gift-image h-48 w-full object-cover rounded" />
              <h3 className="mt-4 text-xl font-semibold text-center">{gift.productName}</h3>
              <p className="mt-2 text-gray-700 text-center">{gift.description}</p>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${gift.productName} - ${gift.description} ${gift.url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto bg-green-500 text-white text-center py-2 rounded hover:bg-green-600"
              >
                Share on WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Main;
