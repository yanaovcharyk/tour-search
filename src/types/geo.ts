export type Country = {
  id: string | number;
  name: string;
  type: "country";
  flag?: string;
};

export type City = {
  id: string | number;
  name: string;
  type: "city";
};

export type Hotel = {
  id: string | number;
  name: string;
  type: "hotel";
  img?: string;
  cityId?: number;
  cityName?: string;
  countryId?: string;
  countryName?: string;
};

export type GeoEntity = Country | City | Hotel;
