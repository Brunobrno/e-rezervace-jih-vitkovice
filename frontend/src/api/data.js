export const getEvent = async ({
  city,
  end_before,
  ordering,
  search,
  square_size,
  start_after,
}) => {
  try {
    const response = await axios.get("/api/booking/events", {
      params: {
        ...(city && { city }),
        ...(end_before && { end_before }),
        ...(ordering && { ordering }),
        ...(search && { search }),
        ...(square_size && { square_size }),
        ...(start_after && { start_after }),
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Chyba při načítání událostí:", error);
    throw error;
  }
};

export const getEventById = async (id, config = {}) => {
  try {
    const response = await api({
      method: "get",
      url: `/api/booking/events/${id}`,
      ...config,
    });

    return response.data;
  } catch (err) {
    throw err;
  }
};

export const createEvent = async ({
  name,
  description,
  start,
  end,
  price_per_m2,
  image,
}, config = {}) => {
  const data = {
    name,
    description,
    start,
    end,
    price_per_m2,
    image,
  };

  try {
    const response = await api({
      method: "post",
      url: "/api/booking/events",
      data,
      ...config,
    });

    return response.data;
  } catch (err) {
    throw err;
  }
};

export const deleteEvent = async (id, config = {}) => {
  try {
    const response = await api({
      method: "delete",
      url: `/api/booking/events/${id}`,
      ...config,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const updateEvent = async (id, data, config = {}) => {
  try {
    const response = await api({
      method: "patch",  // nebo "put" podle API
      url: `/api/booking/events/${id}`,
      data,
      ...config,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getMarketSlots = async (params = {}, config = {}) => {
  const { event, ordering, status } = params;

  if (typeof event !== "number" || Number.isNaN(event)) {
    throw new Error("Parametr 'event' musí být platné číslo (ID eventu) a je povinný.");
  }

  try {
    const response = await api({
      method: "get",
      url: "/api/booking/market-slots",
      params,
      ...config,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const deleteMarketSlot = async (id, config = {}) => {
  try {
    const response = await api({
      method: "delete",
      url: `/api/booking/market-slots/${id}`,
      ...config,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const createMarketSlot = async ({
  event,
  status = "empty",
  base_size = 0,
  available_extension = 0,
  x,
  y,
  width,
  height,
  price_per_m2,
}, config = {}) => {
  const data = {
    event,
    status,
    base_size,
    available_extension,
    x,
    y,
    width,
    height,
    price_per_m2,
  };

  try {
    const response = await api({
      method: "post",
      url: "/api/booking/market-slots",
      data,
      ...config,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getMarketSlotById = async (id, config = {}) => {
  if (typeof id !== "number" || Number.isNaN(id)) {
    throw new Error("Parametr 'id' musí být platné číslo (ID market slotu) a je povinný.");
  }

  try {
    const response = await api({
      method: "get",
      url: `/api/booking/market-slots/${id}`,
      ...config,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};