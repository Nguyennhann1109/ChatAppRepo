import React, { useEffect, useState } from 'react'
import { roomApi } from '../../api/roomApi'

export default function DetailsPanel({ roomId }) {
  const [room, setRoom] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!roomId) {
        setRoom(null)
        return
      }
      try {
        const r = await roomApi.get(roomId)
        if (mounted) setRoom(r)
      } catch (err) {
        console.error('Lỗi load room details', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [roomId])

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Chi tiết</h3>
        {room ? <p className="text-sm text-gray-600">{room.roomName}</p> : <p className="text-sm text-gray-500">Không có phòng được chọn</p>}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <section className="bg-gray-50 p-3 rounded">
          <h4 className="text-sm font-medium text-gray-700">General Info</h4>
          <div className="mt-2 text-sm text-gray-600">
            <p>Members: {/* could fetch members if needed */}</p>
            <p className="mt-1">Type: {room?.isGroup ? 'Group' : 'Private'}</p>
          </div>
        </section>

        <section className="bg-gray-50 p-3 rounded">
          <h4 className="text-sm font-medium text-gray-700">Pre-chat survey</h4>
          <div className="mt-2 text-sm text-gray-600">No survey</div>
        </section>

        <section className="bg-gray-50 p-3 rounded">
          <h4 className="text-sm font-medium text-gray-700">Visited pages</h4>
          <div className="mt-2 text-sm text-gray-600">—</div>
        </section>

        <section className="bg-gray-50 p-3 rounded">
          <h4 className="text-sm font-medium text-gray-700">Additional info</h4>
          <div className="mt-2 text-sm text-gray-600">—</div>
        </section>
      </div>

      <div className="mt-4 text-center">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Xem chi tiết nâng cao</button>
      </div>
    </div>
  )
}
