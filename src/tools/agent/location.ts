/**
 * @file Agent Location Tools
 *
 * Native TypeScript implementation of location-related agent tools.
 */

import { ToolResult } from "../types";

/**
 * Get current location information
 */
export class LocationTools {
  static async getCurrentLocation(): Promise<ToolResult> {
    // Try multiple IP geolocation services as fallbacks
    const apis = [
      {
        url: "https://ipapi.co/json/",
        parser: (data: any) => ({
          ip: data.ip,
          city: data.city || "Unknown",
          region: data.region || "Unknown",
          country: data.country_name || "Unknown",
          countryCode: data.country_code || "Unknown",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          timezone: data.timezone || "Unknown",
          utcOffset: data.utc_offset || "Unknown",
          isp: data.org || "Unknown",
          asn: data.asn || "Unknown",
          postal: data.postal || "Unknown",
          continent: data.continent_code || "Unknown",
          currency: data.currency || "Unknown",
          currencyName: data.currency_name || "Unknown",
          languages: data.languages || "Unknown",
          callingCode: data.country_calling_code || "Unknown",
        }),
      },
      {
        url: "https://ipinfo.io/json",
        parser: (data: any) => {
          const [lat, lon] = (data.loc || "0,0").split(",").map(Number);
          return {
            ip: data.ip,
            city: data.city || "Unknown",
            region: data.region || "Unknown",
            country: LocationTools.getCountryName(data.country) || "Unknown",
            countryCode: data.country || "Unknown",
            latitude: lat || 0,
            longitude: lon || 0,
            timezone: data.timezone || "Unknown",
            utcOffset: "Unknown",
            isp: data.org || "Unknown",
            asn: "Unknown",
            postal: data.postal || "Unknown",
            continent: "Unknown",
            currency: "Unknown",
            currencyName: "Unknown",
            languages: "Unknown",
            callingCode: "Unknown",
          };
        },
      },
    ];

    for (const api of apis) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(api.url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Reynard-Agent-Tools/1.0",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const locationData = await response.json();

        // Check if we got valid data
        if (!locationData || !locationData.ip) {
          throw new Error("Invalid location data received");
        }

        const locationInfo = api.parser(locationData);

        return {
          success: true,
          data: locationInfo,
          logs: [`Location: ${locationInfo.city}, ${locationInfo.country}`],
        };
      } catch (error) {
        // Try next API
        continue;
      }
    }

    // If all APIs fail, return a fallback location
    const fallbackLocation = {
      ip: "127.0.0.1",
      city: "Local",
      region: "Local",
      country: "Local",
      countryCode: "LOC",
      latitude: 0,
      longitude: 0,
      timezone: "UTC",
      utcOffset: "+00:00",
      isp: "Local Network",
      asn: "Unknown",
      postal: "00000",
      continent: "Unknown",
      currency: "USD",
      currencyName: "US Dollar",
      languages: "en",
      callingCode: "+1",
    };

    return {
      success: true,
      data: fallbackLocation,
      logs: [`Location API unavailable, using fallback: ${fallbackLocation.city}, ${fallbackLocation.country}`],
    };
  }

  private static getCountryName(countryCode: string): string {
    const countryMap: Record<string, string> = {
      US: "United States",
      GB: "United Kingdom",
      DE: "Germany",
      FR: "France",
      IT: "Italy",
      ES: "Spain",
      NL: "Netherlands",
      BE: "Belgium",
      AT: "Austria",
      CH: "Switzerland",
      SE: "Sweden",
      NO: "Norway",
      DK: "Denmark",
      FI: "Finland",
      PL: "Poland",
      CZ: "Czech Republic",
      AU: "Australia",
      CA: "Canada",
      JP: "Japan",
      CN: "China",
      IN: "India",
      BR: "Brazil",
      MX: "Mexico",
      AR: "Argentina",
      ZA: "South Africa",
      RU: "Russia",
    };
    return countryMap[countryCode] || countryCode;
  }

  static async getWeatherInfo(): Promise<ToolResult> {
    try {
      // First get location
      const locationResult = await this.getCurrentLocation();
      if (!locationResult.success || !locationResult.data) {
        return {
          success: false,
          error: "Failed to get location for weather lookup",
        };
      }

      const { latitude, longitude, city, country } = locationResult.data;

      // Use OpenWeatherMap API (requires API key)
      const apiKey = process.env["OPENWEATHER_API_KEY"];
      if (!apiKey) {
        return {
          success: false,
          error: "OpenWeatherMap API key not configured",
        };
      }

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error(`Weather API error! status: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();

      const weatherInfo = {
        location: `${city}, ${country}`,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        description: weatherData.weather[0].description,
        main: weatherData.weather[0].main,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        visibility: weatherData.visibility,
        cloudiness: weatherData.clouds.all,
        sunrise: new Date(weatherData.sys.sunrise * 1000).toISOString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toISOString(),
      };

      return {
        success: true,
        data: weatherInfo,
        logs: [`Weather in ${weatherInfo.location}: ${weatherInfo.temperature}°C, ${weatherInfo.description}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get weather information",
      };
    }
  }
}
