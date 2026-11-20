import { http, HttpResponse } from 'msw'
import type { ArtistResponse } from '../../funcionalidades/artistas/tipos'
import type { EventResponse, EventSummaryResponse } from '../../funcionalidades/eventos/tipos'
import type { VenueResponse } from '../../funcionalidades/sedes/tipos'
import type { TicketResponse } from '../../funcionalidades/tickets/tipos'
import type { UserResponse } from '../../funcionalidades/usuarios/tipos'

export const SEDES_MOCK: VenueResponse[] = [
  {
    code: 'VEN-SMR-01',
    name: 'Marina Convention Center',
    city: 'Santa Marta',
    capacity: 3,
    active: true,
  },
  {
    code: 'VEN-BAQ-01',
    name: 'Centro de Convenciones Caribe',
    city: 'Barranquilla',
    capacity: 1200,
    active: true,
  },
  {
    code: 'VEN-CTG-01',
    name: 'Teatro Heredia Hall',
    city: 'Cartagena',
    capacity: 800,
    active: true,
  },
]

export const ARTISTAS_MOCK: ArtistResponse[] = [
  {
    id: 1,
    stageName: 'Solar Beat',
    genre: 'Electrónica',
    active: true,
  },
  {
    id: 2,
    stageName: 'Neon Waves',
    genre: 'Synthwave',
    active: true,
  },
  {
    id: 3,
    stageName: 'Caribbean Sound',
    genre: 'Fusión caribeña',
    active: true,
  },
]

export const EVENTOS_MOCK: EventResponse[] = [
  {
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    description:
      'Tres noches de música caribeña frente a la bahía de Santa Marta, con artistas de la región y propuestas de electrónica y fusión.',
    category: 'MUSIC',
    eventDate: '2026-12-12T20:00:00',
    minimumAge: 18,
    status: 'PUBLISHED',
    venueCode: 'VEN-SMR-01',
    venueName: 'Marina Convention Center',
    venueCity: 'Santa Marta',
    venueCapacity: 3,
    artists: [ARTISTAS_MOCK[0]!, ARTISTAS_MOCK[1]!],
  },
  {
    eventCode: 'CTC-2027',
    name: 'Cumbre Tech Caribe 2027',
    description: 'Conferencia regional de tecnología e innovación.',
    category: 'TECHNOLOGY',
    eventDate: '2027-01-20T09:00:00',
    minimumAge: 0,
    status: 'SOLD_OUT',
    venueCode: 'VEN-BAQ-01',
    venueName: 'Centro de Convenciones Caribe',
    venueCity: 'Barranquilla',
    venueCapacity: 1200,
    artists: [],
  },
]

export const USUARIOS_MOCK: Record<string, UserResponse> = {
  'andrea@pulsepass.test': {
    id: 1,
    username: 'andrea',
    email: 'andrea@pulsepass.test',
    firstName: 'Andrea',
    lastName: 'Ruiz',
    birthDate: '1998-04-12',
    active: true,
  },
  'carlos@pulsepass.test': {
    id: 2,
    username: 'carlos',
    email: 'carlos@pulsepass.test',
    firstName: 'Carlos',
    lastName: 'Peña',
    birthDate: '1995-08-20',
    active: true,
  },
  'laura@pulsepass.test': {
    id: 3,
    username: 'laura',
    email: 'laura@pulsepass.test',
    firstName: 'Laura',
    lastName: 'Gómez',
    birthDate: '2009-05-10',
    active: true,
  },
  'admin@pulsepass.test': {
    id: 4,
    username: 'admin',
    email: 'admin@pulsepass.test',
    firstName: 'Administración',
    lastName: 'PulsePass',
    birthDate: '1990-01-01',
    active: true,
  },
}

export const TICKETS_MOCK: TicketResponse[] = [
  {
    ticketCode: 'TKT-8F2A1C',
    type: 'VIP',
    price: 250000,
    status: 'PAID',
    purchaseDate: '2026-11-05T14:32:00',
    userEmail: 'andrea@pulsepass.test',
    userFullName: 'Andrea Ruiz',
    eventCode: 'CMF-2026',
    eventName: 'Caribbean Music Fest 2026',
  },
  {
    ticketCode: 'TKT-5C90E2',
    type: 'GENERAL',
    price: 90000,
    status: 'USED',
    purchaseDate: '2026-10-12T10:00:00',
    userEmail: 'andrea@pulsepass.test',
    userFullName: 'Andrea Ruiz',
    eventCode: 'NJC-2026',
    eventName: 'Noche de Jazz y Cultura',
  },
  {
    ticketCode: 'TKT-91B07D',
    type: 'GENERAL',
    price: 120000,
    status: 'PAID',
    purchaseDate: '2026-11-06T11:20:00',
    userEmail: 'carlos@pulsepass.test',
    userFullName: 'Carlos Peña',
    eventCode: 'CMF-2026',
    eventName: 'Caribbean Music Fest 2026',
  },
]

function aResumenEvento(ev: EventResponse): EventSummaryResponse {
  return {
    eventCode: ev.eventCode,
    name: ev.name,
    category: ev.category,
    eventDate: ev.eventDate,
    status: ev.status,
    city: ev.venueCity ?? ev.city ?? 'Santa Marta',
    venueName: ev.venueName,
    venueCode: ev.venueCode,
  }
}

export const handlers = [
  // Auth
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { identifier?: string; password?: string }
    if (body.identifier === 'invalido' || body.password === 'incorrecta') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-20T10:00:00Z',
          status: 401,
          error: 'Unauthorized',
          message: 'Credenciales inválidas',
          details: {},
        },
        { status: 401 },
      )
    }

    const token =
      body.identifier === 'admin'
        ? 'jwt-token-admin'
        : body.identifier === 'staff'
          ? 'jwt-token-staff'
          : 'jwt-token-andrea'

    return HttpResponse.json({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 900,
    })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          status: 401,
          error: 'Unauthorized',
          message: 'No autenticado',
          details: {},
        },
        { status: 401 },
      )
    }

    if (auth.includes('admin')) {
      return HttpResponse.json({
        id: 4,
        username: 'admin',
        email: 'admin@pulsepass.test',
        firstName: 'Administración',
        roles: ['ADMIN'],
      })
    }

    if (auth.includes('staff')) {
      return HttpResponse.json({
        id: 3,
        username: 'laura',
        email: 'laura@pulsepass.test',
        firstName: 'Laura',
        roles: ['STAFF'],
      })
    }

    return HttpResponse.json({
      id: 1,
      username: 'andrea',
      email: 'andrea@pulsepass.test',
      firstName: 'Andrea',
      roles: ['USER'],
    })
  }),

  // Venues
  http.get('/api/venues/active', () => {
    return HttpResponse.json(SEDES_MOCK)
  }),

  http.get('/api/venues/:code', ({ params }) => {
    const sede = SEDES_MOCK.find((s) => s.code === params.code)
    if (!sede) {
      return HttpResponse.json(
        {
          status: 404,
          error: 'Not Found',
          message: 'Sede no encontrada',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(sede)
  }),

  // Artists
  http.get('/api/artists/active', () => {
    return HttpResponse.json(ARTISTAS_MOCK)
  }),

  http.get('/api/artists/by-stage-name', ({ request }) => {
    const url = new URL(request.url)
    const stageName = url.searchParams.get('stageName')
    const artista = ARTISTAS_MOCK.find((a) => a.stageName === stageName)
    if (!artista) {
      return HttpResponse.json(
        { status: 404, message: 'Artista no encontrado', details: {} },
        { status: 404 },
      )
    }
    return HttpResponse.json(artista)
  }),

  http.get('/api/artists/:id', ({ params }) => {
    const id = Number(params.id)
    const artista = ARTISTAS_MOCK.find((a) => a.id === id)
    if (!artista) {
      return HttpResponse.json(
        { status: 404, message: 'Artista no encontrado', details: {} },
        { status: 404 },
      )
    }
    return HttpResponse.json(artista)
  }),

  // Events
  http.get('/api/events/published', () => {
    return HttpResponse.json(EVENTOS_MOCK.map(aResumenEvento))
  }),

  http.get('/api/events/by-artist', ({ request }) => {
    const url = new URL(request.url)
    const stageName = url.searchParams.get('stageName')
    const filtrados = EVENTOS_MOCK.filter((ev) =>
      ev.artists.some((a) => a.stageName === stageName),
    )
    return HttpResponse.json(filtrados.map(aResumenEvento))
  }),

  http.get('/api/events/:eventCode/tickets/paid', ({ params }) => {
    const pagados = TICKETS_MOCK.filter(
      (t) => t.eventCode === params.eventCode && t.status === 'PAID',
    )
    return HttpResponse.json(pagados)
  }),

  http.get('/api/events/:eventCode', ({ params }) => {
    const evento = EVENTOS_MOCK.find((e) => e.eventCode === params.eventCode)
    if (!evento) {
      return HttpResponse.json(
        {
          status: 404,
          error: 'Not Found',
          message: 'Evento no encontrado',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(evento)
  }),

  http.post('/api/events', async ({ request }) => {
    const body = (await request.json()) as {
      eventCode: string
      name: string
      description: string
      category: EventResponse['category']
      eventDate: string
      minimumAge: number
      venueCode: string
    }

    const creado: EventResponse = {
      eventCode: body.eventCode,
      name: body.name,
      description: body.description,
      category: body.category,
      eventDate: body.eventDate,
      minimumAge: body.minimumAge,
      status: 'DRAFT',
      venueCode: body.venueCode,
      venueName: 'Marina Convention Center',
      venueCity: 'Santa Marta',
      artists: [],
    }
    return HttpResponse.json(creado, { status: 201 })
  }),

  http.patch('/api/events/:eventCode/publish', ({ params }) => {
    const base = EVENTOS_MOCK[0]!
    return HttpResponse.json({
      ...base,
      eventCode: String(params.eventCode),
      status: 'PUBLISHED',
    })
  }),

  http.post('/api/events/:eventCode/artists/:artistId', ({ params }) => {
    const base = EVENTOS_MOCK[0]!
    const idArt = Number(params.artistId)
    const art = ARTISTAS_MOCK.find((a) => a.id === idArt) ?? ARTISTAS_MOCK[2]!
    return HttpResponse.json({
      ...base,
      eventCode: String(params.eventCode),
      artists: [...base.artists, art],
    })
  }),

  // Users
  http.post('/api/users', async ({ request }) => {
    const body = (await request.json()) as {
      username: string
      email: string
      firstName: string
      lastName: string
      birthDate: string
    }
    return HttpResponse.json(
      {
        id: 10,
        username: body.username,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        birthDate: body.birthDate,
        active: true,
      },
      { status: 201 },
    )
  }),

  http.get('/api/users/by-email', ({ request }) => {
    const url = new URL(request.url)
    const email = url.searchParams.get('email') ?? ''
    const user = USUARIOS_MOCK[email] ?? USUARIOS_MOCK['andrea@pulsepass.test']!
    return HttpResponse.json(user)
  }),

  http.get('/api/users/by-username', ({ request }) => {
    const url = new URL(request.url)
    const username = url.searchParams.get('username') ?? ''
    const user =
      Object.values(USUARIOS_MOCK).find((u) => u.username === username) ??
      USUARIOS_MOCK['andrea@pulsepass.test']!
    return HttpResponse.json(user)
  }),

  // Tickets
  http.post('/api/tickets', async ({ request }) => {
    const body = (await request.json()) as {
      userEmail: string
      eventCode: string
      type: TicketResponse['type']
    }
    const nuevo: TicketResponse = {
      ticketCode: 'TKT-8F2A1C',
      type: body.type,
      price: 250000,
      status: 'PAID',
      purchaseDate: '2026-11-20T10:00:00',
      userEmail: body.userEmail,
      userFullName: 'Andrea Ruiz',
      eventCode: body.eventCode,
      eventName: 'Caribbean Music Fest 2026',
    }
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.get('/api/tickets/by-user', ({ request }) => {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    const propios = TICKETS_MOCK.filter((t) => t.userEmail === email)
    return HttpResponse.json(propios)
  }),

  http.get('/api/tickets/:ticketCode', ({ params }) => {
    const ticket = TICKETS_MOCK.find((t) => t.ticketCode === params.ticketCode)
    if (!ticket) {
      return HttpResponse.json(
        {
          status: 404,
          error: 'Not Found',
          message: 'Ticket no encontrado',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(ticket)
  }),

  http.patch('/api/tickets/:ticketCode/cancel', ({ params }) => {
    const base =
      TICKETS_MOCK.find((t) => t.ticketCode === params.ticketCode) ?? TICKETS_MOCK[0]!
    return HttpResponse.json({
      ...base,
      ticketCode: String(params.ticketCode),
      status: 'CANCELLED',
    })
  }),

  http.patch('/api/tickets/:ticketCode/use', ({ params }) => {
    const base =
      TICKETS_MOCK.find((t) => t.ticketCode === params.ticketCode) ?? TICKETS_MOCK[0]!
    return HttpResponse.json({
      ...base,
      ticketCode: String(params.ticketCode),
      status: 'USED',
    })
  }),
]
