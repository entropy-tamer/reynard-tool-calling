/**
 * @file Agent Location Tools
 * 
 * Native TypeScript implementation of location-related agent tools.
 */

import { registerTool } from '../registry';
import { ToolResult } from '../types';

/**
 * Get current location information
 */
export class LocationTools {
  @registerTool({
    name: 'get_current_location',
    category: 'agent',
    description: 'Get current location based on IP address',
    enabled: true
  })
  static async getCurrentLocation(): Promise<ToolResult> {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const locationData = await response.json();
      
      const locationInfo = {
        ip: locationData.ip,
        city: locationData.city,
        region: locationData.region,
        country: locationData.country_name,
        countryCode: locationData.country_code,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timezone: locationData.timezone,
        utcOffset: locationData.utc_offset,
        isp: locationData.org,
        asn: locationData.asn,
        postal: locationData.postal,
        continent: locationData.continent_code,
        currency: locationData.currency,
        currencyName: locationData.currency_name,
        languages: locationData.languages,
        callingCode: locationData.country_calling_code
      };

      return {
        success: true,
        data: locationInfo,
        logs: [`Location: ${locationInfo.city}, ${locationInfo.country}`]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get location information'
      };
    }
  }

  @registerTool({
    name: 'get_weather_info',
    category: 'agent',
    description: 'Get weather information for current location',
    enabled: true
  })
  static async getWeatherInfo(): Promise<ToolResult> {
    try {
      // First get location
      const locationResult = await this.getCurrentLocation();
      if (!locationResult.success || !locationResult.data) {
        return {
          success: false,
          error: 'Failed to get location for weather lookup'
        };
      }

      const { latitude, longitude, city, country } = locationResult.data;
      
      // Use OpenWeatherMap API (requires API key)
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error: 'OpenWeatherMap API key not configured'
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
        sunset: new Date(weatherData.sys.sunset * 1000).toISOString()
      };

      return {
        success: true,
        data: weatherInfo,
        logs: [`Weather in ${weatherInfo.location}: ${weatherInfo.temperature}°C, ${weatherInfo.description}`]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get weather information'
      };
    }
  }
}
