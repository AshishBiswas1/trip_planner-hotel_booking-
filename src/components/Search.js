"use client"
import { Search as SearchIcon, Calendar, Users } from "lucide-react"

export default function Search() {
  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <SearchIcon className="h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Destination"
                className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Check-in"
                className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Check-out"
                className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-gray-400" />
              <input
                type="number"
                placeholder="Guests"
                className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="text-center mt-6">
            <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
