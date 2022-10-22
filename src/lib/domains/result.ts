export class Result {
  models: [
    {
      model_name: string;
      traffic_volume: number;
    },
  ];
  time: [
    {
      time: string;
      traffic_volume: number;
    },
  ];

  constructor(
    models: [
      {
        model_name: string;
        traffic_volume: number;
      },
    ],
    time: [
      {
        time: string;
        traffic_volume: number;
      },
    ],
  ) {
    this.models = models;
    this.time = time;
  }
}
