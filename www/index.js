var eventSource = new EventSource("/events");

eventSource.addEventListener(
  "message",
  function (e) {
    try {
      var jsonData = JSON.parse(e.data);
      var method = jsonData.method;
      var message = jsonData.message;
      if (
        method === "log" ||
        method === "warn" ||
        method === "error" ||
        method === "info"
      ) {
        var fn = console[method];
        fn(message);
      } else {
        console.log(message);
      }
    } catch (e) {
      console.error(e);
    }
  },
  false
);

eventSource.addEventListener(
  "open",
  function (e) {
    console.log("connection opened");
  },
  false
);

eventSource.addEventListener(
  "error",
  function (e) {
    if (e.readyState == EventSource.CLOSED) {
      console.log("connection closed");
    }
  },
  false
);
