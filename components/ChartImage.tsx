/** @jsxImportSource frog/jsx */
import React from "react";
import "chartjs-adapter-date-fns";
import { ChartConfiguration } from "chart.js";
import { Canvas, createCanvas, registerFont } from "canvas";
import Chart from "chart.js/auto";
import {
  fetchCoingeckoChartDataByPoolAddress,
  fetchCoingeckoTopPoolsByTokenAddress,
} from "../actions/fetch-coingecko-chart-data";
import {
  ChainId,
  chainIdMap,
  getFirstMatchedTokenForTicker,
} from "../actions/ticker-to-address";
import path from "path";

// Define the structure of the data we expect back from the API.
path.resolve(process.cwd(), "fonts", "fonts.conf");
path.resolve(process.cwd(), "fonts", "Inconsolata.ttf");
interface OHLCVResponse {
  data: {
    attributes: {
      ohlcv_list: [number, number, number, number, number, number][];
    };
  };
}

// Define the structure of our chart data.
interface ChartData {
  timestamp: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

async function fetchChartData(
  chain: string,
  token: string
): Promise<ChartData | undefined> {
  try {
    // Adjust the path to point to a known directory relative to the project root
    // For example, assuming the file is located in a 'data' directory at the project root

    const { address, chainId } = await getFirstMatchedTokenForTicker(
      chainIdMap[chain],
      token
    );
    console.log(address, chainId);
    const poolAddress = await fetchCoingeckoTopPoolsByTokenAddress(
      chainId,
      address
    );
    const ohlcv = await fetchCoingeckoChartDataByPoolAddress(
      chainId,
      poolAddress
    );

    const chartData: ChartData = {
      timestamp: [],
      open: [],
      high: [],
      low: [],
      close: [],
      volume: [],
    };

    for (const [timestamp, open, high, low, close, volume] of ohlcv) {
      const dateObj = new Date(timestamp * 1000);
      const formattedDate = dateObj.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      chartData.timestamp.push(formattedDate);
      chartData.open.push(open);
      chartData.high.push(high);
      chartData.low.push(low);
      chartData.close.push(close);
      chartData.volume.push(volume);
    }

    return chartData;
  } catch (error) {
    console.error(`Error reading local JSON data: ${error}`);
    return undefined;
  }
}

export async function renderChart(
  chain: string,
  token: string
): Promise<string> {
  const chartData = await fetchChartData(chain, token);
  if (!chartData) {
    console.error("No chart data available");
    throw new Error("Failed to fetch chart data");
  }

  try {
    const canvas = setupCanvas();
    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    configureCanvasContext(ctx);
    const configuration = prepareChartConfiguration(chartData);
    renderChartOnCanvas(ctx, configuration);
    return convertCanvasToDataURL(canvas);
  } catch (error) {
    console.error("Error rendering chart: ", error);
    throw new Error("Failed to render chart");
  }
}

function setupCanvas(): Canvas {
  const width = 520; // width of the chart
  const height = 270; // height of the chart
  return createCanvas(width, height);
}

function configureCanvasContext(ctx: CanvasRenderingContext2D): void {
  ctx.font = "16px Inconsolata";
}

function prepareChartConfiguration(chartData: ChartData): ChartConfiguration {
  const maxPrice = Math.max(...chartData.high); // Find the maximum price from the high prices
  return {
    type: "line",
    data: {
      labels: chartData.timestamp,
      datasets: [
        {
          label: "Price",
          data: chartData.close,
          fill: false,
          borderColor: "purple",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            parser: "dd MMM yy, HH:mm",
            tooltipFormat: "dd MMM yy, HH:mm",
            unit: "hour",
            displayFormats: {
              hour: "dd MMM, HH:mm",
            },
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 20,
          },
          title: {
            display: true,
            text: "Date and Time",
          },
        },
        y: {
          beginAtZero: false,
          suggestedMax: maxPrice + maxPrice * 0.1, // adding 10% as a buffer
          ticks: {
            callback: function (tickValue: string | number) {
              const value =
                typeof tickValue === "string"
                  ? parseFloat(tickValue)
                  : tickValue;
              return value < 1 ? value.toFixed(8) : value.toFixed(2);
            },
          },
        },
      },
    },
  };
}

function renderChartOnCanvas(
  ctx: CanvasRenderingContext2D,
  configuration: ChartConfiguration
): void {
  new Chart(ctx as any, configuration);
}

function convertCanvasToDataURL(canvas: Canvas): string {
  return canvas.toDataURL("image/png");
}
