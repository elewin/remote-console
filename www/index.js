var eventSource = new EventSource("/events");

eventSource.addEventListener(
  "message",
  function (e) {
    try {
      var jsonData = JSON.parse(e.data);
      var method = jsonData.method; // string
      var message = jsonData.message; //any[]
      if (
        method === "log" ||
        method === "warn" ||
        method === "error" ||
        method === "info"
      ) {
        var fn = console[method];
        fn(...message);
      } else {
        console.log(...message);
      }
    } catch (e) {
      console.error(e);
    }
  },
  false
);

eventSource.addEventListener(
  "error",
  function (e) {
    if (e.readyState == EventSource.CLOSED) {
      console.log("Connection closed");
    }
  },
  false
);
