package com.elitetech_inc.ensarkbank.atm.controller;


import com.elitetech_inc.ensarkbank.atm.dto.mapper.ATMMapper;
import com.elitetech_inc.ensarkbank.atm.dto.request.ATMRequestDTO;
import com.elitetech_inc.ensarkbank.atm.dto.response.ATMResponseDTO;
import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import com.elitetech_inc.ensarkbank.atm.service.ATMService;
import com.elitetech_inc.ensarkbank.branch.service.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;



@RestController
@RequestMapping("/api/atm/")
public class ATMController {


    @Autowired
    private ATMService atmService;

    @Autowired
    private BranchService branchService;

    @Autowired
    private ATMMapper atmMapper;

    @PostMapping
    public ResponseEntity<ATMResponseDTO> save(@RequestBody ATMRequestDTO dto) {

        ATM saved = atmService.save(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(atmMapper.toDTO(saved));
    }


    @GetMapping("")
    public List<ATMResponseDTO> getAll(){
        return atmService.getAll();
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> delete(@PathVariable Long id){

        atmService.delete(id);
        return new ResponseEntity<>("Data deleted" ,HttpStatus.OK);
    }

    @GetMapping("{id}")
    public ResponseEntity<ATMResponseDTO> getById(@PathVariable Long id){
        ATMResponseDTO ps = atmService.findById(id).orElseThrow(
                () -> new RuntimeException("Data not found")
        );
        return new ResponseEntity<>(ps, HttpStatus.OK);
    }

    @PutMapping("{id}")
    public ResponseEntity<ATMResponseDTO> update(@PathVariable Long id, @RequestBody ATMRequestDTO dto) {
        ATM saved = atmService.update(dto, id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(atmMapper.toDTO(saved));
    }

}
