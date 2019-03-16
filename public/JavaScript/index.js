function sendData()
{
    $.ajax({
        dataType: "json",
        url: "http://127.0.0.1:8000/authenticate",
        //url: "https://merlot-auth.herokuapp.com/authenticate",
        type: $("#method").val(),
        data: JSON.parse($("#input").val()),
        complete:
            function (response)
            {
                let data = JSON.parse(response.responseText);

                console.log(data);

                console.log("Sending via " + $("#method").val() + " -> " + $("#input").val());

                $("#responseBox").html("Success -> " + data["success"] + "<br><br>Data -> " + data["data"]);
            }
    });
}