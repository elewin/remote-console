console.log("hello");

var eventSource = new EventSource("/events");

eventSource.addEventListener(
  "message",
  function (e) {
    console.log(e.data);
  },
  false
);

eventSource.addEventListener(
  "open",
  function (e) {
    // Connection was opened.
    console.log("connection opened");
  },
  false
);

eventSource.addEventListener(
  "error",
  function (e) {
    if (e.readyState == EventSource.CLOSED) {
      // Connection was closed.
      console.log("connection closed");
    }
  },
  false
);
