export const tracks = [
  {name: 'Not Specified', location: '', country: '-', code: 'XX'},
  {name: 'Sakhir', location: 'Sakhir', country: 'Bahrain', code: 'BH'},
  {name: 'Jeddah', location: 'Jeddah', country: 'Saudi Arabia', code: 'SA'},
  {name: 'Melbourne', location: 'Melbourne', country: 'Australia', code: 'AU'},
  {name: 'Imola', location: 'Imola', country: 'Italy', code: 'IT', suffix: "EMI"},
  {name: 'Miami', location: 'Miami', country: 'United States', code: 'US', suffix: "MIAMI"},
  {name: 'Catalunya', location: 'Barcelona', country: 'Spain', code: 'ES'},
  {name: 'Monte Carlo', location: 'Monte Carlo', country: 'Monaco', code: 'MC'},
  {name: 'Baku', location: 'Baku', country: 'Azerbaijan', code: 'AZ'},
  {name: 'Montreal', location: 'Montréal', country: 'Canada', code: 'CA'},
  {name: 'Silverstone', location: 'Silverstone', country: 'Great Britain', code: 'GB'},
  {name: 'Spielberg', location: 'Spielberg', country: 'Austria', code: 'AT'},
  {name: 'Paul Ricard', location: 'Le Castellet', country: 'France', code: 'FR'},
  {name: 'Hungaroring', location: 'Budapest', country: 'Hungary', code: 'HU'},
  {name: 'Spa-Francorchamps', location: 'Spa-Francorchamps', country: 'Belgium', code: 'BE'},
  {name: 'Zandvoort', location: 'Zandvoort', country: 'Netherlands', code: 'NL'},
  {name: 'Monza', location: 'Monza', country: 'Italy', code: 'IT'},
  {name: 'Marina Bay', location: 'Marina Bay', country: 'Singapore', code: 'SG'},
  {name: 'Suzuka', location: 'Suzuka', country: 'Japan', code: 'JP'},
  {name: 'Austin', location: 'Austin', country: 'United States', code: 'US', suffix: "AUSTIN"},
  {name: 'Mexico City', location: 'Mexico City', country: 'Mexico', code: 'MX'},
  {name: 'Interlagos', location: 'São Paulo', country: 'Brazil', code: 'BR'},
  {name: 'Yas Marina', location: 'Yas Island', country: 'UAE', code: 'AE'},
].map(x => x.suffix ? {...x, id: x.code + "-" + x.suffix} : {...x, suffix: "", id: x.code})

export const trackMap = {};
tracks.map(x => trackMap[x.id] = x);