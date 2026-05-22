'use client'

import { useState, useTransition, useMemo } from 'react'
import { 
  format, addDays, isSameDay, startOfToday, parseISO, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, addMonths, subMonths, isSameMonth 
} from 'date-fns'
import { es } from 'date-fns/locale'
import { PlusCircle, Trash2, Clock, CalendarDays, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react'
import { addCalendarEvent, deleteCalendarEvent } from './actions'

interface CalendarEvent {
  id: string
  title: string
  date: string
  created_by: string
}

interface Props {
  initialEvents: CalendarEvent[]
  coupleId: string
}

export default function CalendarClient({ initialEvents, coupleId }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [currentMonthView, setCurrentMonthView] = useState<Date>(startOfMonth(startOfToday()))
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventTime, setNewEventTime] = useState('20:00')
  const [isPending, startTransition] = useTransition()
  
  // -- VISTA SEMANAL (Cinta horizontal) --
  const weeklyDays = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => addDays(startOfToday(), i))
  }, [])

  // -- VISTA MENSUAL (Grid) --
  const monthlyDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonthView), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonthView), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonthView])

  const nextMonth = () => setCurrentMonthView(prev => addMonths(prev, 1))
  const prevMonth = () => setCurrentMonthView(prev => subMonths(prev, 1))

  const selectedEvents = initialEvents.filter(ev => isSameDay(parseISO(ev.date), selectedDate))

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return

    const [hours, minutes] = newEventTime.split(':')
    const eventDate = new Date(selectedDate)
    eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    startTransition(async () => {
      await addCalendarEvent(coupleId, newEventTitle, eventDate.toISOString())
      setIsModalOpen(false)
      setNewEventTitle('')
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Borrar este evento de la agenda?')) {
      startTransition(() => {
        deleteCalendarEvent(id)
      })
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      
      {/* Controles del Calendario */}
      <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          {viewMode === 'monthly' ? (
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-1 text-zinc-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span className="font-semibold text-zinc-200 capitalize w-28 text-center">
                {format(currentMonthView, 'MMMM yyyy', { locale: es })}
              </span>
              <button onClick={nextMonth} className="p-1 text-zinc-400 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <span className="font-semibold text-zinc-200 capitalize">
              {format(selectedDate, 'MMMM yyyy', { locale: es })}
            </span>
          )}
        </div>

        {/* Toggle Vista */}
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button 
            onClick={() => setViewMode('weekly')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'weekly' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => {
              setCurrentMonthView(startOfMonth(selectedDate))
              setViewMode('monthly')
            }}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'monthly' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Renderizado de Calendario */}
      <div className="bg-zinc-950/50 shadow-sm">
        {viewMode === 'weekly' ? (
          // Vista Cinta Horizontal
          <div className="no-swipe flex overflow-x-auto gap-2 px-6 py-4 no-scrollbar">
            {weeklyDays.map(day => {
              const isSelected = isSameDay(day, selectedDate)
              const hasEvents = initialEvents.some(ev => isSameDay(parseISO(ev.date), day))
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center min-w-[64px] h-[80px] rounded-2xl transition-all duration-300 relative shrink-0 ${
                    isSelected 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 scale-105' 
                      : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-xs uppercase font-semibold mb-1">
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                    {format(day, 'd')}
                  </span>
                  {hasEvents && !isSelected && (
                    <div className="absolute bottom-2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          // Vista Cuadrícula Mensual
          <div className="no-swipe px-6 py-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div key={i} className="text-center text-xs font-semibold text-zinc-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthlyDays.map(day => {
                const isSelected = isSameDay(day, selectedDate)
                const isCurrentMonth = isSameMonth(day, currentMonthView)
                const isToday = isSameDay(day, startOfToday())
                const hasEvents = initialEvents.some(ev => isSameDay(parseISO(ev.date), day))
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      setSelectedDate(day)
                      if (!isCurrentMonth) setCurrentMonthView(startOfMonth(day))
                    }}
                    className={`
                      relative flex flex-col items-center justify-center h-12 rounded-xl text-sm transition-all
                      ${!isCurrentMonth ? 'opacity-30 text-zinc-500' : 'text-zinc-200'}
                      ${isSelected ? 'bg-emerald-600 text-white shadow-md font-bold scale-105 z-10' : 'hover:bg-zinc-800'}
                      ${isToday && !isSelected ? 'ring-1 ring-emerald-500/50 text-emerald-400 font-bold' : ''}
                    `}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasEvents && (
                      <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Listado de Eventos del día */}
      <div className="p-6 flex-1 bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CalendarDays size={16} />
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
        </h2>

        {selectedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/20 border-2 border-dashed border-zinc-800/50 rounded-3xl">
            <div className="w-12 h-12 bg-zinc-800 text-zinc-600 rounded-full flex items-center justify-center mb-3">
              <Clock size={24} />
            </div>
            <p className="text-zinc-400 font-medium">No hay planes para este día</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map(ev => (
              <div key={ev.id} className="bg-zinc-900 border border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <span className="text-sm font-bold">{format(parseISO(ev.date), 'HH:mm')}</span>
                  </div>
                  <span className="text-zinc-200 font-medium text-lg">{ev.title}</span>
                </div>
                <button 
                  onClick={() => handleDelete(ev.id)}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón Añadir Evento */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-4 shadow-xl shadow-emerald-900/20 pointer-events-auto transition-transform hover:scale-110 active:scale-95"
        >
          <PlusCircle size={32} />
        </button>
      </div>

      {/* Modal Añadir Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-white mb-6">Nuevo Plan</h3>
            
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  ¿Qué vais a hacer?
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: Cena de Aniversario..."
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Hora ({format(selectedDate, "d MMM", { locale: es })})
                </label>
                <input
                  type="time"
                  required
                  value={newEventTime}
                  onChange={e => setNewEventTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-semibold text-zinc-400 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newEventTitle.trim()}
                  className="flex-1 py-4 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 rounded-xl transition-colors"
                >
                  {isPending ? 'Guardando...' : 'Añadir a la Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
