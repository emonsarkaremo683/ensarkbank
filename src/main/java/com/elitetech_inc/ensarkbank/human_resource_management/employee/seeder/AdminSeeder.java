package com.elitetech_inc.ensarkbank.human_resource_management.employee.seeder;

import com.elitetech_inc.ensarkbank.auth_management.user.repository.UserRepository;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.branch_management.branch.service.BranchService;
import com.elitetech_inc.ensarkbank.common.address.district.entity.District;
import com.elitetech_inc.ensarkbank.common.address.district.repository.DistrictRepository;
import com.elitetech_inc.ensarkbank.common.address.division.entity.Division;
import com.elitetech_inc.ensarkbank.common.address.division.repository.DivisionRepository;
import com.elitetech_inc.ensarkbank.common.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.common.address.policestation.repository.PoliceStationRepository;
import com.elitetech_inc.ensarkbank.common.enums.BranchStatus;
import com.elitetech_inc.ensarkbank.common.enums.BranchType;
import com.elitetech_inc.ensarkbank.common.enums.Designation;
import com.elitetech_inc.ensarkbank.common.enums.Gender;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.request.EmployeeRequest;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private static final String HEAD_OFFICE_EMAIL = "head_office@ensarkbank.com";

    private final UserRepository userRepository;
    private final BranchService branchService;
    private final PoliceStationRepository policeStationRepository;
    private final DistrictRepository districtRepository;
    private final DivisionRepository divisionRepository;
    private final EmployeeService employeeService;
    private final BranchRepository branchRepository;


    @Override
    public void run(String... args) {
        Branch headOffice = seedBranch();

        seedUser(
                "superadmin@ensarkbank.com",
                "01531767051",
                "SuperAdmin@123",
                Role.SUPER_ADMIN,
                "Super Admin",
                headOffice.getId(),
                Designation.MANAGING_DIRECTOR
        );

        seedUser(
                "admin@ensarkbank.com",
                "01856789787",
                "Admin@123",
                Role.ADMIN,
                "System Admin",
                headOffice.getId(),
                Designation.GENERAL_MANAGER
        );
    }

    private void seedUser(String email, String phone, String password, Role role, String name, Long branchId, Designation designation) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        EmployeeRequest er = new EmployeeRequest();
        er.setEmail(email);
        er.setPassword(password);
        er.setRole(role);
        er.setBranchId(branchId);
        er.setName(name);
        er.setGender(Gender.MALE);
        er.setPhone(phone);
        er.setDesignation(designation);
        er.setDob(new Date(0));

        employeeService.save(er, null);
    }

    private Branch seedBranch() {
        if (branchRepository.existsByEmail(HEAD_OFFICE_EMAIL)) {
            return branchRepository.findOneByEmail(HEAD_OFFICE_EMAIL)
                    .orElseThrow(() -> new IllegalStateException(
                            "Branch existence check passed but branch could not be fetched: " + HEAD_OFFICE_EMAIL));
        }

        Branch branch = new Branch();
        branch.setName("Head Office");
        branch.setAddress("12A, EnSark Bhaban, Motijheel, Dhaka, Bangladesh");
        branch.setEmail(HEAD_OFFICE_EMAIL);
        branch.setPhoneNumber("01234567890");
        branch.setType(BranchType.HEAD_OFFICE);
        branch.setStatus(BranchStatus.ACTIVE);
        branch.setPoliceStation(getPoliceStation());
        return branchService.createBranch(branch);
    }

    private PoliceStation getPoliceStation() {
        return policeStationRepository.findByName("Motijheel").orElseGet(() -> {
            PoliceStation ps = new PoliceStation();
            ps.setName("Motijheel");
            ps.setDistrict(getDistrict());
            return policeStationRepository.save(ps);
        });
    }

    private District getDistrict() {
        return districtRepository.findByName("Dhaka").orElseGet(() -> {
            District d = new District();
            d.setName("Dhaka");
            d.setDivision(getDivision());
            return districtRepository.save(d);
        });
    }

    private Division getDivision() {
        return divisionRepository.findByName("Dhaka").orElseGet(() -> {
            Division d = new Division();
            d.setName("Dhaka");
            return divisionRepository.save(d);
        });
    }
}