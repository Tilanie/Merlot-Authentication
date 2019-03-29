function sendData()
{
    $.ajax({
        dataType: "json",
        url: "http://127.0.0.1:8000/authenticate",
        //url: "https://merlot-auth.herokuapp.com/authenticate",
        type: $("#method").val(),
        data: JSON.parse($("#input").val()),
        xhrFields: {
            withCredentials: true
        },
        complete:
            function (response)
            {
                if(response.statusText !== "error")
                {
                    console.log(response);

                    let data = JSON.parse(response.responseText);

                    console.log(data);

                    console.log("Sending via " + $("#method").val() + " -> " + $("#input").val());

                    $("#responseBox").html("Success -> " + data["success"] + "<br><br>Data -> " + data["data"]);
                }
                else
                {
                    $("#responseBox").html("Something went wrong...");
                }
            }
    });

    console.log("Sent data:");
    console.log($("#input").val());
}