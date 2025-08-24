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
        try
        {
            var client = _clientService.Create(request.Name, request.Cpf);
            return CreatedAtAction(nameof(GetById), new { id = client.Id }, 
                new ClientResponse(client.Id, client.Name, client.Cpf));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message, type = "validation" });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message, type = "conflict" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Erro interno do servidor", type = "server_error" });
        }
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
        try
        {
            var client = _clientService.Update(id, request.Name, request.Cpf);
            if (client == null)
                return NotFound(new { error = "Cliente não encontrado", type = "not_found" });

            return Ok(new ClientResponse(client.Id, client.Name, client.Cpf));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message, type = "validation" });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message, type = "conflict" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Erro interno do servidor", type = "server_error" });
        }
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
