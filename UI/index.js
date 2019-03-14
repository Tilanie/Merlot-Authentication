function sendData()
{
    $.ajax({
        dataType: "json",
        url: "http://127.0.0.1:8000/authenticate",
        type: "GET",
        data: JSON.parse($("#input").val()),
        complete:
            function (response)
            {

                let data = response.responseText;

                console.log("Sending -> " + $("#input").val())

                $("#responseBox").html(data);
            }
    });
}