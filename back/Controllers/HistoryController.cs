using Microsoft.AspNetCore.Mvc;
using GpsTest.Services;

namespace GpsTest.Controllers;

[ApiController]
[Route("[controller]")]
public class HistoryController : ControllerBase
{
    private readonly IHistoryService _historyService;

    public HistoryController(IHistoryService historyService)
    {
        _historyService = historyService;
    }

    [HttpGet]
    public ActionResult GetAll()
    {
        var history = _historyService.GetAll();
        return Ok(history);
    }
}
