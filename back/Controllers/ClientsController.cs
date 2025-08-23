using Microsoft.AspNetCore.Mvc;
using GpsTest.Services;
using GpsTest.DTOs;

namespace GpsTest.Controllers;

[ApiController]
[Route("[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpPost]
    public ActionResult<ClientResponse> Create([FromBody] CreateClientRequest request)
    {
        var client = _clientService.Create(request.Name, request.Cpf);
        return CreatedAtAction(nameof(GetById), new { id = client.Id }, 
            new ClientResponse(client.Id, client.Name, client.Cpf));
    }

    [HttpGet]
    public ActionResult<IEnumerable<ClientResponse>> GetAll()
    {
        var clients = _clientService.GetAll();
        return Ok(clients.Select(c => new ClientResponse(c.Id, c.Name, c.Cpf)));
    }

    [HttpGet("{id:guid}")]
    public ActionResult<ClientResponse> GetById(Guid id)
    {
        var client = _clientService.Get(id);
        if (client == null)
            return NotFound();

        return Ok(new ClientResponse(client.Id, client.Name, client.Cpf));
    }

    [HttpPut("{id:guid}")]
    public ActionResult<ClientResponse> Update(Guid id, [FromBody] UpdateClientRequest request)
    {
        var client = _clientService.Update(id, request.Name, request.Cpf);
        if (client == null)
            return NotFound();

        return Ok(new ClientResponse(client.Id, client.Name, client.Cpf));
    }

    [HttpDelete("{id:guid}")]
    public ActionResult Delete(Guid id)
    {
        var client = _clientService.Get(id);
        if (client == null)
            return NotFound();

        _clientService.Delete(id);
        return NoContent();
    }
}
