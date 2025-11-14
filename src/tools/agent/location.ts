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
    try {
      // Use a free IP geolocation service with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
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

      const locationInfo = {
        ip: locationData.ip,
        city: locationData.city || "Unknown",
        region: locationData.region || "Unknown",
        country: locationData.country_name || "Unknown",
        countryCode: locationData.country_code || "Unknown",
        latitude: locationData.latitude || 0,
        longitude: locationData.longitude || 0,
        timezone: locationData.timezone || "Unknown",
        utcOffset: locationData.utc_offset || "Unknown",
        isp: locationData.org || "Unknown",
        asn: locationData.asn || "Unknown",
        postal: locationData.postal || "Unknown",
        continent: locationData.continent_code || "Unknown",
        currency: locationData.currency || "Unknown",
        currencyName: locationData.currency_name || "Unknown",
        languages: locationData.languages || "Unknown",
        callingCode: locationData.country_calling_code || "Unknown",
      };

      return {
        success: true,
        data: locationInfo,
        logs: [`Location: ${locationInfo.city}, ${locationInfo.country}`],
      };
    } catch (error) {
      // Return a fallback location if API fails
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
