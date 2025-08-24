using Microsoft.AspNetCore.Mvc;
using GpsTest.Services;
using GpsTest.DTOs;

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
    public ActionResult GetAll([FromQuery]int? page, [FromQuery]int? pageSize)
    {
        if (page.HasValue && pageSize.HasValue)
        {
            var result = _historyService.GetPaged(page.Value, pageSize.Value);
            return Ok(new PagedResult<object>(result.Items, page.Value, pageSize.Value, result.TotalCount));
        }
        var history = _historyService.GetAll();
        return Ok(history);
    }
}
