import { useState } from 'react';
import { useHistoryStore } from '@/store/useHistoryStore';
import dayjs from 'dayjs';
import { Loader } from 'lucide-react';
import { useLiabilityStore } from '../../store/useLiabilityStore';

const GetLiabilityByDate = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const {  liability ,  isLoading, getLiabilityByDate  } = useHistoryStore();
  


  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDate) {
      getLiabilityByDate(selectedDate);
    }
  };


  

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Liabilities by Date</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                max={dayjs().format('YYYY-MM-DD')}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader className='animate-spin'/> : 'Search'}
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : liability.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Products sold on {dayjs(selectedDate).format('MMMM D, YYYY')}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      total
                    </th>
                    
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liability.map((liability) => (
                    <tr key={liability.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{liability.name.toLocaleUpperCase()}</div>
                        <div className="text-sm text-gray-500">{liability.description.toLocaleUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${liability.quantity.toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${liability.price.toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {liability.price * liability.quantity}
                      </td>
                    </tr>
                  ))}
                  
                     
                     
                    
                
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No liability found for {dayjs(selectedDate).format('MMMM D, YYYY')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetLiabilityByDate;